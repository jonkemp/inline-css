'use strict';

var parseCSS = require('css-rules'),
    cheerio = require('cheerio'),
    pseudoCheck = require('./pseudoCheck'),
    handleRule = require('./handleRule'),
    flatten = require('flatten'),
    setStyleAttrs = require('./setStyleAttrs'),
    setWidthAttrs = require('./setWidthAttrs'),
    removeClassId = require('./removeClassId'),
    setTableAttrs = require('./setTableAttrs'),
    pick = require('object.pick');

function replaceCodeBlock(html, re, block) {
    return html.replace(re, function () {
        return block;
    });
}

module.exports = function (html, css, options) {
    var opts = options || {},
        rules,
        editedElements = [],
        codeBlockLookup = [],
        encodeCodeBlocks = function (_html) {
            var __html = _html,
                blocks = opts.codeBlocks;

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
        $;

    $ = cheerio.load(encodeEntities(html), pick(opts, [
        'xmlMode',
        'decodeEntities',
        'lowerCaseTags',
        'lowerCaseAttributeNames',
        'recognizeCDATA',
        'recognizeSelfClosing'
    ]));

    try {
        rules = parseCSS(css);
    } catch (err) {
        throw new Error(err);
    }

    rules.forEach(function (rule) {
        var el,
            ignoredPseudos;

        ignoredPseudos = pseudoCheck(rule);

        if (ignoredPseudos) {
            return false;
        }

        try {
            el = handleRule(rule, $);

            editedElements.push(el);
        } catch (err) {
            // skip invalid selector
            return false;
        }
    });

    // flatten array if nested
    editedElements = flatten(editedElements);

    editedElements.forEach(function (el) {
        setStyleAttrs(el, $);

        if (opts.applyWidthAttributes) {
            setWidthAttrs(el, $);
        }

        if (opts.removeHtmlSelectors) {
            removeClassId(el, $);
        }
    });

    if (opts.applyTableAttributes) {
        $('table').each(function (index, el) {
            setTableAttrs(el, $);
        });
    }

    return decodeEntities($.html());
};
