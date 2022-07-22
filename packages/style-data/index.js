const mediaQueryText = require('mediaquery-text');
const cheerio = require('cheerio');
const pick = require('pick-util');

function replaceCodeBlock(html, re, block) {
    return html.replace(re, () => block);
}

module.exports = (html, options, callback) => {
    const results = {};

    const codeBlocks = {
        EJS: { start: '<%', end: '%>' },
        HBS: { start: '{{', end: '}}' }
    };

    const codeBlockLookup = [];

    const encodeCodeBlocks = _html => {
        let __html = _html;
        const blocks = Object.assign(codeBlocks, options.codeBlocks);

        Object.keys(blocks).forEach(key => {
            const re = new RegExp(`${blocks[key].start}([\\S\\s]*?)${blocks[key].end}`, 'g');

            __html = __html.replace(re, match => {
                codeBlockLookup.push(match);
                return `EXCS_CODE_BLOCK_${codeBlockLookup.length - 1}_`;
            });
        });
        return __html;
    };

    const decodeCodeBlocks = _html => {
        let index;
        let re;
        let __html = _html;

        for (index = 0; index < codeBlockLookup.length; index++) {
            re = new RegExp(`EXCS_CODE_BLOCK_${index}_(="")?`, 'gi');
            __html = replaceCodeBlock(__html, re, codeBlockLookup[index]);
        }
        return __html;
    };

    const encodeEntities = _html => encodeCodeBlocks(_html);
    const decodeEntities = _html => decodeCodeBlocks(_html);
    let $;
    let styleDataList;
    let styleData;

    $ = cheerio.load(encodeEntities(html), Object.assign({
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

        styleDataList = element.childNodes;
        if (styleDataList.length !== 1) {
            callback(new Error('empty style element'));
            return;
        }
        styleData = styleDataList[0].data;
        if (options.applyStyleTags) {
            results.css.push(styleData);
        }
        if (options.removeStyleTags) {
            if (options.preserveMediaQueries) {
                mediaQueries = mediaQueryText(element.childNodes[0].nodeValue);
                element.childNodes[0].nodeValue = mediaQueries;
            }
            if (!mediaQueries) {
                $(element).remove();
            }
        }
    });

    results.html = decodeEntities($.html());

    callback(null, results);
};
