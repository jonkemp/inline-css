'use strict';

var mediaQueryText = require('mediaquery-text'),
    cheerio = require('cheerio'),
    extend = require('extend'),
    pick = require('object.pick');

module.exports = function (html, options, callback) {
    var results = {},
        $ = cheerio.load(html, extend({
            decodeEntities: false
        }, pick(options, [
            'xmlMode',
            'decodeEntities',
            'lowerCaseTags',
            'lowerCaseAttributeNames',
            'recognizeCDATA',
            'recognizeSelfClosing'
        ]))),
        styleDataList,
        styleData;

    results.css = [];

    $('style').each(function (index, element) {
        var mediaQueries;

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
            } else {
                $(element).remove();
            }
        }
    });

    results.html = $.html();

    callback(null, results);
};
