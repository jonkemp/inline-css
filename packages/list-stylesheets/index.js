'use strict';

var cheerio = require('cheerio');

module.exports = function (html, options) {
    var results = {};
    var $ = cheerio.load(html);

    results.hrefs = [];

    $('link').each(function (index, element) {
        var $el = $(element);
        if ($el.attr('rel').toLowerCase() === 'stylesheet') {
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
