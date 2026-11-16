const inlineContent = require('./lib/inlineContent');
const { normalizePolicy, error } = require('./lib/internal/resource-policy');

const defaults = {
    extraCss: '',
    applyStyleTags: true,
    removeStyleTags: true,
    applyLinkTags: true,
    removeLinkTags: true,
    preserveMediaQueries: false,
    removeHtmlSelectors: false,
    applyWidthAttributes: false,
    applyTableAttributes: false,
    codeBlocks: {
        EJS: { start: '<%', end: '%>' },
        HBS: { start: '{{', end: '}}' }
    },
    xmlMode: false,
    decodeEntities: false,
    lowerCaseTags: true,
    lowerCaseAttributeNames: false,
    recognizeCDATA: false,
    recognizeSelfClosing: false
};


const validateBooleans = options => {
    for (const key of [ 'applyStyleTags', 'removeStyleTags', 'applyLinkTags', 'removeLinkTags', 'preserveMediaQueries', 'removeHtmlSelectors', 'applyWidthAttributes', 'applyTableAttributes', 'xmlMode', 'decodeEntities', 'lowerCaseTags', 'lowerCaseAttributeNames', 'recognizeCDATA', 'recognizeSelfClosing' ]) {
        if (typeof options[key] !== 'boolean') {
            throw error('INVALID_OPTIONS', `options.${key} must be a boolean`);
        }
    }
};
const validateTextOptions = options => {
    if (typeof options.extraCss !== 'string' || (options.url !== undefined && typeof options.url !== 'string')) {
        throw error('INVALID_OPTIONS', 'Invalid extraCss or url');
    }
};

module.exports = async (html, options) => {
    const opts = Object.assign({}, defaults, options);

    validateBooleans(opts);
    validateTextOptions(opts);
    opts.resourcePolicy = normalizePolicy(opts.resourcePolicy);
    return inlineContent(String(html), opts);
};
