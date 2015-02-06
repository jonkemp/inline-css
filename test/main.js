/* jshint node: true */
/* global describe, it */

'use strict';

var should = require('should'),
    fs = require('fs'),
    path = require('path'),
    gutil = require('gulp-util'),
    inlineCss = require('../index');

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

    options.url = 'file://' + file.path;

    inlineCss(file.contents.toString('utf8'), options, function (err, html) {
        html.should.be.equal(String(fs.readFileSync(expectedPath)));

        done();
    });
}

describe('inline-css', function() {
    it('Should convert linked css to inline css', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'in.html'), path.join('test', 'expected', 'out.html'), options, done);
    });

    it('Should inline css in multiple HTML files', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'multiple', 'one', 'in.html'), path.join('test', 'expected', 'multiple', 'one', 'out.html'), options, function () {});
        compare(path.join('test', 'fixtures', 'multiple', 'two', 'in.html'), path.join('test', 'expected', 'multiple', 'two', 'out.html'), options, done);
    });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'alpha.html'), path.join('test', 'expected', 'alpha.html'), options, done);
        });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'cascading.html'), path.join('test', 'expected', 'cascading.html'), options, done);
        });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'class.html'), path.join('test', 'expected', 'class.html'), options, done);
        });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'class+id.html'), path.join('test', 'expected', 'class+id.html'), options, done);
        });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'css-quotes.html'), path.join('test', 'expected', 'css-quotes.html'), options, done);
    });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'direct-descendents.html'), path.join('test', 'expected', 'direct-descendents.html'), options, done);
        });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'empty.html'), path.join('test', 'expected', 'empty.html'), options, done);
    });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'id.html'), path.join('test', 'expected', 'id.html'), options, done);
        });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'identical-important.html'), path.join('test', 'expected', 'identical-important.html'), options, done);
        });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'ignore-pseudos.html'), path.join('test', 'expected', 'ignore-pseudos.html'), options, done);
    });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'important.html'), path.join('test', 'expected', 'important.html'), options, done);
    });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'media.html'), path.join('test', 'expected', 'media.html'), options, done);
    });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'normalize.html'), path.join('test', 'expected', 'normalize.html'), options, done);
        });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'preserve-events.html'), path.join('test', 'expected', 'preserve-events.html'), options, done);
    });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'regression-media.html'), path.join('test', 'expected', 'regression-media.html'), options, done);
    });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'regression-selector-newline.html'), path.join('test', 'expected', 'regression-selector-newline.html'), options, done);
    });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'specificity.html'), path.join('test', 'expected', 'specificity.html'), options, done);
    });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'style-preservation.html'), path.join('test', 'expected', 'style-preservation.html'), options, done);
    });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'tag.html'), path.join('test', 'expected', 'tag.html'), options, done);
    });

    it('Should inline css in edge case', function(done) {
        var options = {};
        compare(path.join('test', 'fixtures', 'yui-reset.html'), path.join('test', 'expected', 'yui-reset.html'), options, done);
    });
});
