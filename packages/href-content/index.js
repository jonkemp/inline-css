const fs = require('node:fs');
const { normalizePolicy, authorizeFile, createContext, CONTEXT } = require('resource-policy');
const getRemoteContent = require('remote-content');

module.exports = (destHref, sourceHref, options, callback) => {
    const run = async () => {
        const policy = normalizePolicy(options.resourcePolicy);
        const ownContext = !options[CONTEXT];
        const context = options[CONTEXT] || createContext(policy);

        try {
            context.check();
            const url = new URL(destHref, URL.canParse(sourceHref) ? sourceHref : undefined);

            if (url.protocol !== 'file:') {
                return await new Promise((resolve, reject) => getRemoteContent(url.href, { ...options, [CONTEXT]: context }, (err, value) => err ? reject(err) : resolve(value)));
            }
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
        } catch (cause) {
            throw context.signal.aborted ? context.signal.reason : cause;
        } finally {
            if (ownContext) {
                context.close();
            }
        }
    };

    Promise.resolve().then(run).then(value => callback(null, value), cause => callback(cause));
};
