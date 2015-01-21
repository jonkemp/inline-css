'use strict';

var url = require('url'),
    fs = require('fs'),
    getRemoteContent = require('remote-content');

module.exports = function (destHref, sourceHref, callback) {
    if (url.parse(sourceHref).protocol === 'file:' && destHref[0] === '/') {
        destHref = destHref.slice(1);
    }
    var resolvedUrl = url.resolve(sourceHref, destHref);
    var parsedUrl = url.parse(resolvedUrl);
    if (parsedUrl.protocol === 'file:') {
        fs.readFile(decodeURIComponent(parsedUrl.pathname), 'utf8', callback);
    } else {
        getRemoteContent(resolvedUrl, callback);
    }
};
