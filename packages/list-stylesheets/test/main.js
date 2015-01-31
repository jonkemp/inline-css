/* jshint node: true */
/* global describe, it */

'use strict';

var should = require('should'),
    fs = require('fs'),
    path = require('path'),
    gutil = require('gulp-util'),
    getStylesheetList = require('../index');

function getFile(filePath) {
    return new gutil.File({
        path: path.resolve(filePath),
        cwd: './test/',
        base: path.dirname(filePath),
        contents: new Buffer(String(fs.readFileSync(filePath)))
    });
}

function compare(fixturePath, expectedHTML, options, done) {
    var file = getFile(fixturePath);

    var data = getStylesheetList(file.contents.toString('utf8'), options);
    data.hrefs[0].should.be.equal('file.css');
    data.html.should.be.equal(String(fs.readFileSync(expectedHTML)));
    done();
}

describe('list-stylesheets', function() {
    it('Should list stylesheets from an html file', function(done) {
        var options = {
            applyLinkTags: true,
            removeLinkTags: true
        };
        compare(path.join('test', 'fixtures', 'in.html'), path.join('test', 'expected', 'out.html'), options, done);
    });
});
