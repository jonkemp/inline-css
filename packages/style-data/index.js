const mediaQueryText = require('mediaquery-text');
const cheerio = require('cheerio');
const pick = require('pick-util');

const { protect } = require('./lib/internal/template-blocks');

const qualifiedMedia = media => media && media.trim() && media.trim().toLowerCase() !== 'all';
const wrapMedia = (styleData, media) => qualifiedMedia(media) ? `@media ${media} {\n${styleData}\n}` : styleData;
const removeStyle = (el, styleData, options) => {
    let mediaQueries;

    if (options.preserveMediaQueries) {
        const media = el.attr('media');

        mediaQueries = qualifiedMedia(media) ? wrapMedia(styleData, media) : mediaQueryText(styleData);
        el.removeAttr('media').text(mediaQueries);
    }
    if (!mediaQueries) {
        el.remove();
    }
};
const collectStyle = (el, styleData, { options, results, decodeEntities }) => {
    if (options.applyStyleTags) {
        results.css.push(decodeEntities(wrapMedia(styleData, el.attr('media'))));
    }
    if (options.removeStyleTags) {
        removeStyle(el, styleData, options);
    }
};

const processStyle = (el, { options, results, decodeEntities }) => {
    // Embedded styles are intentionally preserved without applying them.
    if (typeof el.data('embed') !== 'undefined') {
        return;
    }
    const styleData = el.html() || '';

    if (!styleData.trim()) {
        if (options.removeStyleTags) {
            el.remove();
        }
        return;
    }
    collectStyle(el, styleData, { options, results, decodeEntities });
};
const extract = (html, options) => {
    const results = {};

    const protectedHtml = protect(html, options.codeBlocks);
    const decodeEntities = protectedHtml.restore;
    let $;

    $ = cheerio.load(protectedHtml.html, Object.assign({
        decodeEntities: false
    }, pick(options, [
        'xmlMode',
        'decodeEntities',
        'lowerCaseTags',
        'lowerCaseAttributeNames',
        'recognizeCDATA',
        'recognizeSelfClosing'
    ])));

    results.css = [];

    $('style').each((index, element) => processStyle($(element), { options, results, decodeEntities }));

    results.html = decodeEntities($.html());

    return results;
};

module.exports = (html, options, callback) => {
    let result;

    try {
        result = extract(html, options);
    } catch (cause) {
        callback(cause);
        return;
    }
    callback(null, result);
};
