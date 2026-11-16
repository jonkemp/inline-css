const fs = require('node:fs');
const { normalizePolicy, authorizeFile, createContext, CONTEXT } = require('./lib/internal/resource-policy');
const getRemoteContent = require('remote-content');

const resolveUrl = (destHref, sourceHref) => new URL(destHref, URL.canParse(sourceHref) ? sourceHref : undefined);
const readFile = async (url, policy, context) => {
    const target = await authorizeFile(url, policy);

    context.check();
    const chunks = [];
    let bytes = 0;
    const stream = fs.createReadStream(target, { signal: context.signal });

    for await (const chunk of stream) {
        bytes += chunk.length;
        context.charge(chunk.length, bytes);
        chunks.push(chunk);
    }
    context.check();
    return Buffer.concat(chunks).toString('utf8');
};

const failureReason = (context, cause) => context.signal.aborted ? context.signal.reason : cause;

module.exports = (destHref, sourceHref, ...[ options, callback ]) => {
    const run = async () => {
        const policy = normalizePolicy(options.resourcePolicy);
        const ownContext = !options[CONTEXT];
        const context = options[CONTEXT] || createContext(policy);

        try {
            context.check();
            const url = resolveUrl(destHref, sourceHref);

            if (url.protocol !== 'file:') {
                return await new Promise((resolve, reject) => getRemoteContent(url.href, { ...options, [CONTEXT]: context }, (err, value) => err ? reject(err) : resolve(value)));
            }
            return await readFile(url, policy, context);
        } catch (cause) {
            throw failureReason(context, cause);
        } finally {
            if (ownContext) {
                context.close();
            }
        }
    };

    Promise.resolve().then(run).then(value => callback(null, value), cause => callback(cause));
};
