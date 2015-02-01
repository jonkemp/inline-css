/* jshint node: true */
/* global describe, it */

'use strict';

var should = require('should'),
    fs = require('fs'),
    path = require('path'),
    gutil = require('gulp-util'),
    getRemoteContent = require('../index');

function getFile(filePath) {
    return new gutil.File({
        path: path.resolve(filePath),
        cwd: './test/',
        base: path.dirname(filePath),
        contents: new Buffer(String(fs.readFileSync(filePath)))
    });
}

function compare(remotePath, fixturePath, done) {
    getRemoteContent(remotePath, function (err, css) {
        console.log(css);
        css.should.be.equal(String(fs.readFileSync(fixturePath)));

        done();
    });
}

describe('href-content', function() {
    it('Should get remote content from link tags in an HTML document', function(done) {
        compare('https://raw.githubusercontent.com/jonkemp/remote-content/master/test/fixtures/file.css', path.join('test', 'fixtures', 'file.css'), done);
    });
});
