/* jshint node: true */
/* global describe, it */

'use strict';

var should = require('should'),
    fs = require('fs'),
    path = require('path'),
    Vinyl = require('vinyl'),
    getStylesheetList = require('../index');

function getFile(filePath) {
    return new Vinyl({
        path: path.resolve(filePath),
        cwd: './test/',
        base: path.dirname(filePath),
        contents: new Buffer(String(fs.readFileSync(filePath)))
    });
}

describe('list-stylesheets', function () {
    it('Should list stylesheets from an html file', function (done) {
        var options = {
            applyLinkTags: true,
            removeLinkTags: true
        };

        function compare(fixturePath, expectedHTML) {
            var file = getFile(fixturePath),
                data = getStylesheetList(file.contents.toString('utf8'), options);

            data.hrefs[0].should.be.equal('file.css');
            data.html.should.be.equal(String(fs.readFileSync(expectedHTML)));
            done();
        }

        compare(path.join('test', 'fixtures', 'in.html'), path.join('test', 'expected', 'out.html'), options, done);
    });

    it('Should ignore hbs code blocks', function (done) {
        var options = {
            applyLinkTags: true,
            removeLinkTags: true
        };

        function compare(fixturePath, expectedHTML) {
            var file = getFile(fixturePath),
                data = getStylesheetList(file.contents.toString('utf8'), options);

            data.hrefs[0].should.be.equal('codeblocks.css');
            data.html.should.be.equal(String(fs.readFileSync(expectedHTML)));
            done();
        }

        compare(path.join('test', 'fixtures', 'codeblocks.html'), path.join('test', 'expected', 'codeblocks.html'), options, done);
    });

    it('Should ignore ejs code blocks', function (done) {
        var options = {
            applyLinkTags: true,
            removeLinkTags: true
        };

        function compare(fixturePath, expectedHTML) {
            var file = getFile(fixturePath),
                data = getStylesheetList(file.contents.toString('utf8'), options);

            data.hrefs[0].should.be.equal('ejs.css');
            data.html.should.be.equal(String(fs.readFileSync(expectedHTML)));
            done();
        }

        compare(path.join('test', 'fixtures', 'ejs.html'), path.join('test', 'expected', 'ejs.html'), options, done);
    });

    it('Should ignore user defined code blocks', function (done) {
        var options = {
            codeBlocks: {
                craze: { start: '<<', end: '>>' }
            }
        };

        function compare(fixturePath, expectedHTML) {
            var file = getFile(fixturePath),
                data = getStylesheetList(file.contents.toString('utf8'), options);

            data.html.should.be.equal(String(fs.readFileSync(expectedHTML)));
            done();
        }

        compare(path.join('test', 'fixtures', 'codeblocks-external.html'), path.join('test', 'expected', 'codeblocks-external.html'), options, done);
    });
});
