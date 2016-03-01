/*eslint-disable */

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

function compare(fixturePath, expectedHTML, css, options, done) {
    var file = getFile(fixturePath);

    getStylesData(file.contents.toString('utf8'), options, function (err, results) {
        results.html.should.be.equal(String(fs.readFileSync(expectedHTML)));
        should.deepEqual(results.css, css);
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
        compare(path.join('test', 'fixtures', 'in.html'), path.join('test', 'expected', 'out.html'), [ '\n      h1 {\n        border: 1px solid #ccc;\n      }\n    ' ], options, done);
    });

    it('Should leave html from no style html', function(done) {
        var options = {
            applyStyleTags: true,
            removeStyleTags: true,
            preserveMediaQueries: false
        };
        compare(path.join('test', 'fixtures', 'no-style-tag', 'in.html'), path.join('test', 'expected', 'no-style-tag', 'out.html'), [], options, done);
    });

    it('Should leave style blocks if they contain media queries', function(done) {
        var options = {
            applyStyleTags: true,
            removeStyleTags: true,
            preserveMediaQueries: true
        };
        compare(path.join('test', 'fixtures', 'media-queries', 'in.html'), path.join('test', 'expected', 'media-queries', 'out.html'), [ '\n      h1 {\n        border: 1px solid #ccc;\n      }\n    ', '\n      @media only screen and (min-width: 640px) {\n        .headline {\n          color: blue;\n        }\n      }\n    '], options, done);
    });
});
