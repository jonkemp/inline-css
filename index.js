'use strict';

var Promise = require('bluebird'),
    inlineContent = require('./lib/inlineContent');

function extend(obj, src) {
    var key,
        own = {}.hasOwnProperty;

    for (key in src) {
        if (own.call(src, key)) {
            obj[key] = src[key];
        }
    }
    return obj;
}

module.exports = function (html, options) {
    return new Promise(function (resolve, reject) {
        var opt = extend({
            extraCss: '',
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
