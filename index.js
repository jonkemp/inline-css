'use strict';

var assert = require('assert'),
    extractCss = require('extract-css'),
    inlineCss = require('./lib/inline-css');

function extend(obj, src) {
    var own = {}.hasOwnProperty;

    for (var key in src) {
        if (own.call(src, key)) {
            obj[key] = src[key];
        }
    }
    return obj;
}

function inlineCssWithCb(html, css, options, callback) {
    var content;

    try {
        content = inlineCss(html, css, options);
        callback(null, content);
    } catch (err) {
        callback(err);
    }
}

function inlineContent(src, options, callback) {
    assert.ok(options.url, 'options.url is required');
    extractCss(src, options, function (err, html, css) {
        if (err) {
            return callback(err);
        }

        css += '\n' + options.extraCss;
        inlineCssWithCb(html, css, options, callback);
    });
}

module.exports = function (html, options, callback) {
    var opt = extend({
            extraCss: '',
            applyStyleTags: true,
            removeStyleTags: true,
            applyLinkTags: true,
            removeLinkTags: true,
            preserveMediaQueries: false,
            applyWidthAttributes: false,
        }, options);

    inlineContent(html, opt, function (err, content) {
        if (err) {
            callback(err);
        } else {
            callback(null, content);
        }
    });
};
