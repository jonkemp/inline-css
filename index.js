const inlineContent = require('./lib/inlineContent');
const { normalizePolicy, error } = require('resource-policy');

module.exports = (html, options) => new Promise((resolve, reject) => {
    const opt = Object.assign({}, {
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
    }, options);

    try {
        for (const key of [ 'applyStyleTags', 'removeStyleTags', 'applyLinkTags', 'removeLinkTags', 'preserveMediaQueries', 'removeHtmlSelectors', 'applyWidthAttributes', 'applyTableAttributes', 'xmlMode', 'decodeEntities', 'lowerCaseTags', 'lowerCaseAttributeNames', 'recognizeCDATA', 'recognizeSelfClosing' ]) {
            if (typeof opt[key] !== 'boolean') {
                throw error('INVALID_OPTIONS', `options.${key} must be a boolean`);
            }
        }
        if (typeof opt.extraCss !== 'string' || (opt.url !== undefined && typeof opt.url !== 'string')) {
            throw error('INVALID_OPTIONS', 'Invalid extraCss or url');
        }
        opt.resourcePolicy = normalizePolicy(opt.resourcePolicy);
    } catch (cause) {
        reject(cause);
        return;
    }
    inlineContent(String(html), opt)
        .then(data => {
            resolve(data);
        })
        .catch(err => {
            reject(err);
        });
});
