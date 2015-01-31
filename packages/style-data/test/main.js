/* jshint node: true */
/* global describe, it */

'use strict';

var should = require('should'),
    fs = require('fs'),
    path = require('path'),
    gutil = require('gulp-util'),
    getStylesData = require('../index');

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

    getStylesData(file.contents.toString('utf8'), options, function (err, results) {
        results.html.should.be.equal(String(fs.readFileSync(expectedHTML)));
        should.deepEqual(results.css, [ '\n      h1 {\n        border: 1px solid #ccc;\n      }\n    ' ]);
        done();
    });
}

describe('style-data', function() {
    it('Should separate css and html', function(done) {
        var options = {
            applyStyleTags: true,
            removeStyleTags: true,
            preserveMediaQueries: false
        };
        compare(path.join('test', 'fixtures', 'in.html'), path.join('test', 'expected', 'out.html'), options, done);
    });
});
