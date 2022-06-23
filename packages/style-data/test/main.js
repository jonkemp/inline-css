/*eslint-disable */

const should = require('should');
const fs = require('fs');
const path = require('path');
const Vinyl = require('vinyl');
const beautify = require('js-beautify').html;
const getStylesData = require('../index');

function getFile(filePath) {
    return new Vinyl({
        path: path.resolve(filePath),
        cwd: './test/',
        base: path.dirname(filePath),
        contents: Buffer.from(String(fs.readFileSync(filePath)))
    });
}

function compare(fixturePath, expectedHTML, css, options, done) {
    const file = getFile(fixturePath);

    getStylesData(file.contents.toString('utf8'), options, (err, results) => {
        beautify(results.html, {
            "preserve-newlines": false
        }).should.be.equal(
            beautify(String(fs.readFileSync(expectedHTML)), {
                "preserve-newlines": false
            })
        );
        should.deepEqual(results.css, css);
        done();
    });
}

describe('style-data', () => {
    it('Should separate css and html', done => {
        const options = {
            applyStyleTags: true,
            removeStyleTags: true,
            preserveMediaQueries: false
        };

        compare(
            path.join(__dirname, 'fixtures', 'in.html'),
            path.join(__dirname, 'expected', 'out.html'),
            [ '\n      h1 {\n        border: 1px solid #ccc;\n      }\n    ' ],
            options,
            done
        );
    });

    it('Should leave html from no style html', done => {
        const options = {
            applyStyleTags: true,
            removeStyleTags: true,
            preserveMediaQueries: false
        };

        compare(
            path.join(__dirname, 'fixtures', 'no-style-tag', 'in.html'),
            path.join(__dirname, 'expected', 'no-style-tag', 'out.html'),
            [],
            options,
            done
        );
    });

    it('Should leave style blocks if they contain media queries', done => {
        const options = {
            applyStyleTags: true,
            removeStyleTags: true,
            preserveMediaQueries: true
        };

        compare(
            path.join(__dirname, 'fixtures', 'media-queries', 'in.html'),
            path.join(__dirname, 'expected', 'media-queries', 'out.html'),
            [ '\n      h1 {\n        border: 1px solid #ccc;\n      }\n    ', '\n      @media only screen and (min-width: 640px) {\n        .headline {\n          color: blue;\n        }\n      }\n    ' ],
            options,
            done
        );
    });

    it('Should ignore hbs code blocks', done => {
        const options = {
            applyStyleTags: true,
            removeStyleTags: true,
            preserveMediaQueries: true
        };

        compare(
            path.join(__dirname, 'fixtures', 'codeblocks.html'),
            path.join(__dirname, 'expected', 'codeblocks.html'),
            [],
            options,
            done
        );
    });

    it('Should ignore ejs code blocks', done => {
        const options = {
            applyStyleTags: true,
            removeStyleTags: true,
            preserveMediaQueries: true
        };

        compare(
            path.join(__dirname, 'fixtures', 'ejs.html'),
            path.join(__dirname, 'expected', 'ejs.html'),
            [],
            options,
            done
        );
    });

    it('Should ignore user defined code blocks', done => {
        const options = {
            codeBlocks: {
                craze: { start: '<<', end: '>>' }
            }
        };

        compare(
            path.join(__dirname, 'fixtures', 'codeblocks-external.html'),
            path.join(__dirname, 'expected', 'codeblocks-external.html'),
            [],
            options,
            done
        );
    });

    it('Should ignore style blocks if data-embed attribute is present on them', done => {
        const options = {
            applyStyleTags: true,
            removeStyleTags: true,
            preserveMediaQueries: true
        };

        compare(
            path.join(__dirname, 'fixtures', 'data-embed', 'in.html'),
            path.join(__dirname, 'expected', 'data-embed', 'out.html'),
            [ '\n      h1 {\n        border: 1px solid #ccc;\n      }\n    ' ],
            options,
            done
        );
    });
});
