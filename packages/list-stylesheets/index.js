'use strict';

var cheerio = require('cheerio'),
    extend = require('extend'),
    pick = require('object.pick');

module.exports = function (html, options) {
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
        ])));

    results.hrefs = [];

    $('link').each(function (index, element) {
        var $el = $(element);

        if ($el.attr('rel') && $el.attr('rel').toLowerCase() === 'stylesheet') {
            if (options.applyLinkTags) {
                results.hrefs.push($el.attr('href'));
            }
            if (options.removeLinkTags) {
                $el.remove();
            }
        }
    });

    results.html = $.html();

    return results;
};
