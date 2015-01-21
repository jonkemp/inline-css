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

function getDefaultOptions(options) {
    return extend({
        extraCss: '',
        applyStyleTags: true,
        removeStyleTags: true,
        applyLinkTags: true,
        removeLinkTags: true,
        preserveMediaQueries: false,
        applyWidthAttributes: false,
    }, options);
}

function inlineDocumentWithCb(html, css, options, callback) {
    var content;

    try {
        content = inlineCss(html, css, options);
        callback(null, content);
    } catch (err) {
        callback(err);
    }
}

function juiceDocument(src, options, callback) {
    assert.ok(options.url, 'options.url is required');
    options = getDefaultOptions(options);
    extractCss(src, options, function (err, html, css) {
        if (err) {
            return callback(err);
        }

        css += '\n' + options.extraCss;
        inlineDocumentWithCb(html, css, options, callback);
    });
}

module.exports = function (html, options, callback) {
    assert.ok(options.url, 'options.url is required');
    options = getDefaultOptions(options);

    juiceDocument(html, options, function (err, content) {
        if (err) {
            callback(err);
        } else {
            callback(null, content);
        }
    });
};
