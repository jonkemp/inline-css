const inlineContent = require('./lib/inlineContent');

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

    inlineContent(String(html), opt)
        .then(data => {
            resolve(data);
        })
        .catch(err => {
            reject(err);
        });
});
