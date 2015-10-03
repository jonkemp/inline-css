'use strict';

var extractCss = require('extract-css'),
    inlineCss = require('./lib/inline-css'),
    Promise = require('bluebird');

function extend(obj, src) {
    var own = {}.hasOwnProperty;

    for (var key in src) {
        if (own.call(src, key)) {
            obj[key] = src[key];
        }
    }
    return obj;
}

function inlineContent(src, options) {
    return new Promise(function (resolve, reject) {
        var content;

        if (!options.url) {
            reject('options.url is required');
        }

        extractCss(src, options, function (err, html, css) {
            if (err) {
                return reject(err);
            }

            css += '\n' + options.extraCss;
            content = inlineCss(html, css, options);
            resolve(content);
        });
    });

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
