const assert = require('assert');
const Batch = require('batch');
const getStylesData = require('style-data');
const getStylesheetList = require('list-stylesheets');
const getHrefContent = require('href-content');

module.exports = (html, options, callback) => {
    const batch = new Batch();
    const data = getStylesheetList(html, options);

    batch.push(cb => {
        getStylesData(data.html, options, cb);
    });
    if (data.hrefs.length) {
        assert.ok(options.url, 'options.url is required');
    }
    data.hrefs.forEach(stylesheetHref => {
        batch.push(cb => {
            getHrefContent(stylesheetHref, options.url, cb);
        });
    });
    batch.end((err, results) => {
        let stylesData;
        let css;

        if (err) {
            return callback(err);
        }

        stylesData = results.shift();

        results.forEach(content => {
            stylesData.css.push(content);
        });
        css = stylesData.css.join('\n');

        return callback(null, stylesData.html, css);
    });
};
