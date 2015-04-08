'use strict';

var mediaQueryText = require('mediaquery-text'),
    cheerio = require('cheerio');

module.exports = function (html, options, callback) {
    var results = {},
        $ = cheerio.load(html, {
            decodeEntities: false
        }),
        styleDataList,
        styleData;

    results.css = [];

    $('style').each(function (index, element) {
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
                var mediaQueries = mediaQueryText(element.childNodes[0].nodeValue);
                element.childNodes[0].nodeValue = mediaQueries;
            } else {
                $(element).remove();
            }
        }
    });

    results.html = $.html();

    callback(null, results);
};
