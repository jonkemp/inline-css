/* jshint node: true */
/* global describe, it */

'use strict';

var should = require('should'),
    fs = require('fs'),
    path = require('path'),
    mediaQueryText = require('../index');

describe('mediaquery-text', function() {
    it('Should return Media Query text for a CSS source', function(done) {
        var mediaQueries = mediaQueryText(String(fs.readFileSync(path.join('test', 'fixtures', 'file.css'))));
        mediaQueries.should.be.equal(String(fs.readFileSync(path.join('test', 'expected', 'file.css'))));
        done();
    });
});
