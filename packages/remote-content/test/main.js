/* jshint node: true */
/* global describe, it */

'use strict';

var should = require('should'),
    fs = require('fs'),
    path = require('path'),
    getRemoteContent = require('../index');

function compare(remotePath, fixturePath, done) {
    getRemoteContent(remotePath, function (err, css) {
        css.should.be.equal(String(fs.readFileSync(fixturePath)));

        done();
    });
}

describe('href-content', function() {
    it('Should get remote content from link tags in an HTML document', function(done) {
        compare('https://raw.githubusercontent.com/jonkemp/remote-content/master/test/fixtures/file.css', path.join('test', 'fixtures', 'file.css'), done);
    });
});
