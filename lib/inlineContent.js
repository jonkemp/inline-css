const extractCss = require('extract-css');
const inlineCss = require('./inline-css');
const { error } = require('resource-policy');

module.exports = (src, options) => new Promise((resolve, reject) => {
    if (!options.url) {
        reject(error('INVALID_OPTIONS', 'options.url is required'));
        return;
    }
    extractCss(src, options, (err, html, css, metadata) => {
        if (err) {
            reject(err);
            return;
        }
        try {
            if (options.removeHtmlSelectors && metadata.hasRetainedCss) {
                throw error('SELECTOR_RETENTION_CONFLICT', 'Cannot remove class/id attributes while CSS is retained');
            }
            resolve(inlineCss(html, css, options));
        } catch (cause) {
            reject(cause);
        }
    });
});
