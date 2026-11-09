const mediaQueryText = require('mediaquery-text');
const cheerio = require('cheerio');
const pick = require('pick-util');

const { protect } = require('inline-css-template-blocks');

const extract = (html, options) => {
    const results = {};

    const protectedHtml = protect(html, options.codeBlocks);
    const decodeEntities = protectedHtml.restore;
    let $;
    let styleData;

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

    $('style').each((index, element) => {
        let mediaQueries;

        // if data-embed property exists, skip inlining and removing
        if (typeof $(element).data('embed') !== 'undefined') {
            return;
        }

        styleData = $(element).html() || '';
        if (!styleData.trim()) {
            if (options.removeStyleTags) {
                $(element).remove();
            }
            return;
        }
        const media = $(element).attr('media');
        const qualified = media && media.trim() && media.trim().toLowerCase() !== 'all';

        if (options.applyStyleTags) {
            results.css.push(decodeEntities(qualified ? `@media ${media} {\n${styleData}\n}` : styleData));
        }
        if (options.removeStyleTags) {
            if (options.preserveMediaQueries) {
                mediaQueries = qualified ? `@media ${media} {\n${styleData}\n}` : mediaQueryText(styleData);
                $(element).removeAttr('media').text(mediaQueries);
            }
            if (!mediaQueries) {
                $(element).remove();
            }
        }
    });

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
