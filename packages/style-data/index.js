'use strict';

var mediaQueryText = require('mediaquery-text'),
    cheerio = require('cheerio'),
    extend = require('extend'),
    pick = require('object.pick');

function replaceCodeBlock(html, re, block) {
    return html.replace(re, function () {
        return block;
    });
}

module.exports = function (html, options, callback) {
    var results = {},
        codeBlocks = {
            EJS: { start: '<%', end: '%>' },
            HBS: { start: '{{', end: '}}' }
        },
        codeBlockLookup = [],
        encodeCodeBlocks = function (_html) {
            var __html = _html,
                blocks = extend(codeBlocks, options.codeBlocks);

            Object.keys(blocks).forEach(function (key) {
                var re = new RegExp(blocks[key].start + '([\\S\\s]*?)' + blocks[key].end, 'g');

                __html = __html.replace(re, function (match) {
                    codeBlockLookup.push(match);
                    return 'EXCS_CODE_BLOCK_' + (codeBlockLookup.length - 1) + '_';
                });
            });
            return __html;
        },
        decodeCodeBlocks = function (_html) {
            var index, re,
                __html = _html;

            for (index = 0; index < codeBlockLookup.length; index++) {
                re = new RegExp('EXCS_CODE_BLOCK_' + index + '_(="")?', 'gi');
                __html = replaceCodeBlock(__html, re, codeBlockLookup[index]);
            }
            return __html;
        },
        encodeEntities = function (_html) {
            return encodeCodeBlocks(_html);
        },
        decodeEntities = function (_html) {
            return decodeCodeBlocks(_html);
        },
        $, styleDataList, styleData;

    $ = cheerio.load(encodeEntities(html), extend({
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

    $('style').each(function (index, element) {
        var mediaQueries;

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
