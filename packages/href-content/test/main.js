/* eslint-disable */

'use strict';

var should = require('should'),
    fs = require('fs'),
    path = require('path'),
    gutil = require('gulp-util'),
    getStylesheetList = require('list-stylesheets'),
    getHrefContent = require('../index');

function getFile(filePath) {
    return new gutil.File({
        path: path.resolve(filePath),
        cwd: './test/',
        base: path.dirname(filePath),
        contents: new Buffer(String(fs.readFileSync(filePath)))
    });
}

function compare(fixturePath, expectedPath, options, done) {
    var file = getFile(fixturePath);
    var data = getStylesheetList(file.contents.toString('utf8'), options);

    var url = 'file://' + file.path;

    getHrefContent(data.hrefs[0], url, function (err, css) {
        css.should.be.equal(String(fs.readFileSync(expectedPath)));

        done();
    });
}

describe('href-content', function() {
    it('Should get content from link tags in an HTML document', function(done) {
        var options = {
            applyLinkTags: true,
            removeLinkTags: true
        };
        compare(path.join('test', 'fixtures', 'in.html'), path.join('test', 'fixtures', 'file.css'), options, done);
    });

    it('Should get content from link tags in in multiple HTML files', function(done) {
        var options = {
            applyLinkTags: true,
            removeLinkTags: true
        };
        compare(path.join('test', 'fixtures', 'multiple', 'one', 'in.html'), path.join('test', 'fixtures', 'multiple', 'one', 'file.css'), options, function () {});
        compare(path.join('test', 'fixtures', 'multiple', 'two', 'in.html'), path.join('test', 'fixtures', 'multiple', 'two', 'file.css'), options, done);
    });

    it('Should handle malformed CSS', function(done) {
        var options = {
            applyLinkTags: true,
            removeLinkTags: true
        };
        compare(path.join('test', 'fixtures', 'malformed.html'), path.join('test', 'fixtures', 'malformed.css'), options, done);
    });
});
