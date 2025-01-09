const url = require('url');
const fs = require('fs');
const getRemoteContent = require('remote-content');

module.exports = (destHref, sourceHref, callback) => {
    let resolvedUrl;
    let parsedUrl;
    let toUrl = destHref;
    let dataUrlRegex = /^data:\w+\/\w+;base64,([^\"]*)/;

    if ((dataUrlMatch = dataUrlRegex.exec(destHref)) != null) {
        try {
            let buf = Buffer.from(dataUrlMatch[1], "base64");
            callback(null, buf.toString());
        } catch (error) {
            callback(error, null);
        };
    }
    if (url.parse(sourceHref).protocol === 'file:' && destHref[0] === '/') {
        toUrl = destHref.slice(1);
    }
    resolvedUrl = url.resolve(sourceHref, toUrl);
    parsedUrl = url.parse(resolvedUrl);
    if (parsedUrl.protocol === 'file:') {
        fs.readFile(decodeURIComponent(parsedUrl.pathname), 'utf8', callback);
    } else {
        getRemoteContent(resolvedUrl, callback);
    }
};
