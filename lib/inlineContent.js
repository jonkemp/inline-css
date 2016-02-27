'use strict';

var Promise = require('bluebird'),
    extractCss = require('extract-css'),
    inlineCss = require('./inline-css');

module.exports = function inlineContent(src, options) {
    return new Promise(function (resolve, reject) {
        var content;

        if (!options.url) {
            reject('options.url is required');
        }

        extractCss(src, options, function (err, html, css) {
            var extraCss;

            if (err) {
                return reject(err);
            }

            extraCss = css + '\n' + options.extraCss;

            try {
                content = inlineCss(html, extraCss, options);
            } catch (e) {
                return reject(e);
            }

            resolve(content);
        });
    });

};
