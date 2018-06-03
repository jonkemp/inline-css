'use strict';

var superagent = require('superagent'),
    getProxyForUrl = require('proxy-from-env').getProxyForUrl;

// extend with Request#proxy()
require('superagent-proxy')(superagent);

module.exports = function (remoteUrl, callback) {
    var proxyUrl = getProxyForUrl(remoteUrl),
        superagentCallback = function (err, resp) {
            if (err) {
                return callback(err);
            } else if (resp.ok) {
                return callback(null, resp.text);
            }
            return callback(new Error('GET ' + remoteUrl + ' ' + resp.status));
        };

    if (proxyUrl) {
        superagent.get(remoteUrl).proxy(proxyUrl).buffer().end(superagentCallback);
    } else {
        superagent.get(remoteUrl).buffer().end(superagentCallback);
    }
};
