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

module.exports = function (html, css, options) {
    var opts = options || {},
        rules,
        editedElements = [],
        $ = cheerio.load(html, pick(opts, [
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

    return $.html();
};
