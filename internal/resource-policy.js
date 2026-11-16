const fs = require('node:fs');
const path = require('node:path');
const dns = require('node:dns');
const net = require('node:net');
const { fileURLToPath } = require('node:url');
const ipaddr = require('ipaddr.js');

const ROOT_PATH = Symbol.for('inline-css.v5.configured-file-root');
const defaults = Object.freeze({
    allowedOrigins: [], fileRoot: null, allowPrivateNetworks: false,
    timeoutMs: 10000, maxStylesheetBytes: 1048576, maxTotalBytes: 10485760,
    maxStylesheets: 32, concurrency: 4, maxRedirects: 5
});
const error = (kind, message, cause) => Object.assign(new Error(message, cause ? { cause } : undefined), { code: `ERR_INLINE_CSS_${kind}` });
const isHttp = url => [ 'http:', 'https:' ].includes(url.protocol);
const hasCredentials = url => url.username || url.password;
const hasSuffix = url => url.search || url.hash;
const validOrigin = (origin, url) => typeof origin === 'string' && isHttp(url) && !hasCredentials(url) && url.pathname === '/' && !hasSuffix(url);
const normalizeOrigin = origin => {
    try {
        const url = new URL(origin);

        if (!validOrigin(origin, url)) {
            throw new Error('Invalid origin');
        }
        return url.origin;
    } catch (cause) {
        throw error('INVALID_OPTIONS', 'allowedOrigins must contain HTTP(S) origins', cause);
    }
};
const validatePolicyTypes = policy => {
    if (policy.timeoutMs > 2147483647 || typeof policy.allowPrivateNetworks !== 'boolean' || !Array.isArray(policy.allowedOrigins)) {
        throw error('INVALID_OPTIONS', 'Invalid resource policy');
    }
};
const validateLimits = policy => {
    for (const key of [ 'timeoutMs', 'maxStylesheetBytes', 'maxTotalBytes', 'maxStylesheets', 'concurrency', 'maxRedirects' ]) {
        if (!Number.isSafeInteger(policy[key]) || policy[key] < (key === 'maxRedirects' ? 0 : 1)) {
            throw error('INVALID_OPTIONS', `Invalid resourcePolicy.${key}`);
        }
    }
    validatePolicyTypes(policy);
};
const validateDirectory = directory => {
    if (typeof directory !== 'string' || !path.isAbsolute(directory) || !fs.statSync(directory).isDirectory()) {
        throw new Error('Invalid directory');
    }
};
const normalizeRoot = (policy, input) => {
    if (policy.fileRoot === null) {
        return;
    }
    try {
        validateDirectory(policy.fileRoot);
        policy[ROOT_PATH] = input[ROOT_PATH] || path.resolve(policy.fileRoot);

        // Match fs.promises.realpath below, including Windows 8.3 expansion.
        policy.fileRoot = fs.realpathSync.native(policy.fileRoot);
    } catch (cause) {
        throw error('INVALID_OPTIONS', 'fileRoot must be an existing absolute directory', cause);
    }
};
const normalizePolicy = (input = {}) => {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        throw error('INVALID_OPTIONS', 'resourcePolicy must be an object');
    }
    const policy = { ...defaults, ...input };

    validateLimits(policy);
    policy.allowedOrigins = policy.allowedOrigins.map(normalizeOrigin);
    normalizeRoot(policy, input);
    return policy;
};
const checkAddress = (address, policy) => {
    if (!net.isIP(address)) {
        throw error('RESOURCE_DENIED', 'Invalid network address');
    }
    const parsed = ipaddr.process(address);

    if (!policy.allowPrivateNetworks && parsed.range() !== 'unicast') {
        throw error('RESOURCE_DENIED', 'Nonpublic network destination denied');
    }
};
const parseResourceUrl = input => {
    try {
        return new URL(input);
    } catch (cause) {
        throw error('RESOURCE_DENIED', 'Invalid stylesheet URL', cause);
    }
};
const authorizeUrl = (input, policy) => {
    const url = parseResourceUrl(input);

    if (!isHttp(url) || hasCredentials(url) || !policy.allowedOrigins.includes(url.origin)) {
        throw error('RESOURCE_DENIED', 'Stylesheet origin or scheme denied');
    }
    const host = url.hostname.replace(/^\[|\]$/g, '');

    if (net.isIP(host)) {
        checkAddress(host, policy);
    }
    return url;
};
const validateFileHost = url => {
    if (url.hostname && url.hostname !== 'localhost') {
        throw error('RESOURCE_DENIED', 'Remote file authorities are not supported');
    }
};
const filePath = (input, policy) => {
    if (!policy.fileRoot) {
        throw error('RESOURCE_DENIED', 'File stylesheet access requires fileRoot');
    }
    const url = new URL(input);

    if (url.protocol !== 'file:' || hasCredentials(url) || hasSuffix(url)) {
        throw error('RESOURCE_DENIED', 'Invalid file stylesheet URL');
    }
    validateFileHost(url);
    return fileURLToPath(url);
};
const outside = relative => relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative);
const validateLexicalPath = (decoded, policy) => {
    const lexical = path.relative(policy.fileRoot, decoded);
    const configured = path.relative(policy[ROOT_PATH] || policy.fileRoot, decoded);

    if (outside(lexical) && outside(configured)) {
        throw error('RESOURCE_DENIED', 'Stylesheet path is outside fileRoot');
    }
};
const authorizeFile = async (input, policy) => {
    const decoded = filePath(input, policy);

    validateLexicalPath(decoded, policy);
    const target = await fs.promises.realpath(decoded);

    if (outside(path.relative(policy.fileRoot, target))) {
        throw error('RESOURCE_DENIED', 'Stylesheet is outside fileRoot');
    }
    return target;
};
const createLookup = policy => (hostname, options, callback) => {
    const opts = typeof options === 'number' ? { family: options } : options || {};

    dns.lookup(hostname, { all: true, verbatim: true }, (err, addresses) => {
        if (err) {
            return callback(err);
        }
        let usable;

        try {
            addresses.forEach(({ address }) => checkAddress(address, policy));
            usable = addresses.filter(item => !opts.family || item.family === opts.family);

            if (!usable.length) {
                throw error('RESOURCE_DENIED', 'No authorized address for requested family');
            }
            if (opts.all) {
                return callback(null, usable);
            }
            return callback(null, usable[0].address, usable[0].family);

        } catch (cause) {
            return callback(cause);
        }
    });
};
const CONTEXT = Symbol.for('inline-css.v5.resource-context');
const createContext = policy => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(error('RESOURCE_TIMEOUT', 'Stylesheet resource loading timed out')), policy.timeoutMs);

    timer.unref();
    return {
        policy, signal: controller.signal, bytes: 0,
        abort: reason => controller.abort(reason), close: () => clearTimeout(timer),
        check() {
            if (controller.signal.aborted) {
                throw controller.signal.reason;
            }
        },
        charge(bytes, perFile) {
            this.check();
            this.bytes += bytes;
            if (perFile > policy.maxStylesheetBytes || this.bytes > policy.maxTotalBytes) {
                const reason = error('RESOURCE_LIMIT', 'Stylesheet byte budget exceeded');

                controller.abort(reason);
                throw reason;
            }
        }
    };
};

module.exports = { normalizePolicy, authorizeUrl, authorizeFile, createLookup, checkAddress, createContext, CONTEXT, error };
