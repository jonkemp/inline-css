const axios = require('axios');
const getProxyForUrl = require('proxy-from-env').getProxyForUrl;

module.exports = (remoteUrl, callback) => {
    const axiosConfig = {};
    const proxyUrl = getProxyForUrl(remoteUrl);

    if (proxyUrl) {
        const proxyUrlData = new URL(proxyUrl);

        axiosConfig.proxy = {
            protocol: proxyUrlData.protocol.replace(':', ''),
            host: proxyUrlData.hostname,
            port: proxyUrlData.port,
        };
    }

    axios.get(remoteUrl, axiosConfig).then(response => {
        if (response.statusText === 'OK') {
            return callback(null, response.data);
        }

        return callback(new Error(`GET ${remoteUrl} ${response.status}`));
    }).catch(error => {
        callback(error);
    });
};
