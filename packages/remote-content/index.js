const superagent = require('superagent');
const getProxyForUrl = require('proxy-from-env').getProxyForUrl;

// extend with Request#proxy()
require('superagent-proxy')(superagent);

module.exports = (remoteUrl, callback) => {
    const proxyUrl = getProxyForUrl(remoteUrl);

    const superagentCallback = (err, {ok, text, status}) => {
        if (err) {
            return callback(err);
        } else if (ok) {
            return callback(null, text);
        }
        return callback(new Error(`GET ${remoteUrl} ${status}`));
    };

    if (proxyUrl) {
        superagent.get(remoteUrl).proxy(proxyUrl).buffer().end(superagentCallback);
    } else {
        superagent.get(remoteUrl).buffer().end(superagentCallback);
    }
};
