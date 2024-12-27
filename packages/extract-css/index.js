const assert = require('assert');
const async = require('async');
const getStylesData = require('style-data');
const getStylesheetList = require('list-stylesheets');
const getHrefContent = require('href-content');

module.exports = (html, options, callback) => {
    const tasks = [];
    const data = getStylesheetList(html, options);

    tasks.push(cb => {
        getStylesData(data.html, options, cb);
    });
    if (data.hrefs.length) {
        assert.ok(options.url, 'options.url is required');
    }
    data.hrefs.forEach(stylesheetHref => {
        tasks.push(cb => {
            getHrefContent(stylesheetHref, options.url, cb);
        });
    });

    async.parallel(tasks, (err, results) => {
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
