'use strict';

var extend = require('./lib/extend'),
    Promise = require('bluebird'),
    inlineContent = require('./lib/inlineContent');

module.exports = function (html, options) {
    return new Promise(function (resolve, reject) {
        var opt = extend({
            extraCss: '',
            cheerioOptions: {},
            applyStyleTags: true,
            removeStyleTags: true,
            applyLinkTags: true,
            removeLinkTags: true,
            preserveMediaQueries: false,
            removeHtmlSelectors: false,
            applyWidthAttributes: false,
            applyTableAttributes: false
        }, options);

        inlineContent(html, opt)
            .then(function (data) {
                resolve(data);
            })
            .catch(function (err) {
                reject(err);
            });
    });
};
