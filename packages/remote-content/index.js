'use strict';

var superagent = require('superagent');

module.exports = function (remoteUrl, callback) {
    superagent.get(remoteUrl).buffer().end(function (err, resp) {
        if (err) {
            return callback(err);
        } else if (resp.ok) {
            return callback(null, resp.text);
        }
        callback(new Error('GET ' + remoteUrl + ' ' + resp.status));
    });
};
