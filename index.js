'use strict';

var Promise = require('bluebird'),
    extend = require('extend'),
    inlineContent = require('./lib/inlineContent');

module.exports = function (html, options) {
    return new Promise(function (resolve, reject) {
        var opt = extend(true, {
            extraCss: '',
            applyStyleTags: true,
            removeStyleTags: true,
            applyLinkTags: true,
            removeLinkTags: true,
            preserveMediaQueries: false,
            removeHtmlSelectors: false,
            applyWidthAttributes: false,
            applyTableAttributes: false,
            codeBlocks: {
                EJS: { start: '<%', end: '%>' },
                HBS: { start: '{{', end: '}}' }
            },
            xmlMode: false,
            decodeEntities: false,
            lowerCaseTags: true,
            lowerCaseAttributeNames: false,
            recognizeCDATA: false,
            recognizeSelfClosing: false
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
