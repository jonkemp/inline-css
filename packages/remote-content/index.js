const http = require('node:http');
const https = require('node:https');
const axios = require('axios');
const { normalizePolicy, authorizeUrl, createLookup, createContext, CONTEXT, error } = require('./lib/internal/resource-policy');

const readBody = async (stream, context) => {
    const chunks = [];
    let bytes = 0;

    for await (const chunk of stream) {
        bytes += chunk.length;
        context.charge(chunk.length, bytes);
        chunks.push(chunk);
    }
    context.check();
    return Buffer.concat(chunks).toString('utf8');
};
const redirectTarget = (response, { url, redirects, policy }) => {
    if (![ 301, 302, 303, 307, 308 ].includes(response.status) || !response.headers.location) {
        return null;
    }
    response.data.destroy();
    if (redirects >= policy.maxRedirects) {
        throw error('RESOURCE_LIMIT', 'Stylesheet redirect budget exceeded');
    }
    return new URL(response.headers.location, url).href;
};
const validateStatus = response => {
    if (response.status < 200 || response.status >= 300) {
        response.data.destroy();
        throw new Error(`Stylesheet HTTP status ${response.status}`);
    }
};

const fetchCss = async (remoteUrl, { client, context, policy }) => {
    let target = remoteUrl;

    for (let redirects = 0; ; redirects++) {
        context.check();
        const url = authorizeUrl(target, policy);
        const response = await client.get(url.href, { signal: context.signal });

        const redirect = redirectTarget(response, { url, redirects, policy });

        if (redirect) {
            target = redirect;
            continue;
        }
        validateStatus(response);
        return await readBody(response.data, context);
    }
};
const failureReason = (context, cause) => context.signal.aborted ? context.signal.reason : cause;

module.exports = (remoteUrl, options, callback) => {
    const run = async () => {
        const policy = normalizePolicy(options.resourcePolicy);
        const ownContext = !options[CONTEXT];
        const context = options[CONTEXT] || createContext(policy);
        const httpAgent = new http.Agent({ lookup: createLookup(policy), keepAlive: false });
        const httpsAgent = new https.Agent({ lookup: createLookup(policy), keepAlive: false });
        const client = new axios.Axios({ adapter: axios.getAdapter('http'), proxy: false, httpAgent, httpsAgent, maxRedirects: 0, responseType: 'stream', decompress: true, headers: { Accept: 'text/css,*/*;q=0.1' }, validateStatus: () => true });

        try {
            return await fetchCss(remoteUrl, { client, context, policy });
        } catch (cause) {
            throw failureReason(context, cause);
        } finally {
            httpAgent.destroy();
            httpsAgent.destroy();
            if (ownContext) {
                context.close();
            }
        }
    };

    Promise.resolve().then(run).then(value => callback(null, value), cause => callback(cause));
};
