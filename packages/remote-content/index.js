'use strict';

var superagent = require('superagent');

module.exports = function (remoteUrl, callback) {
    superagent.get(remoteUrl).buffer().end(function (err, resp) {
        if (err) {
            callback(err);
        } else if (resp.ok) {
            callback(null, resp.text);
        } else {
            callback(new Error('GET ' + remoteUrl + ' ' + resp.status));
        }
    });
};
