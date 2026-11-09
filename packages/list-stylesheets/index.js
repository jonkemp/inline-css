const cheerio = require('cheerio');
const pick = require('pick-util');

const { protect } = require('inline-css-template-blocks');

module.exports = (html, options) => {
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

    results.hrefs = [];

    $('link').each((index, element) => {
        const $el = $(element);

        if ($el.attr('rel') && $el.attr('rel').toLowerCase() === 'stylesheet') {
            if (options.applyLinkTags) {
                results.hrefs.push($el.attr('href'));
            }
            if (options.removeLinkTags) {
                $el.remove();
            }
        }
    });

    results.html = decodeEntities($.html());

    return results;
};
