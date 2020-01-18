/* eslint-disable */

const should = require('should');
const fs = require('fs');
const path = require('path');
const Vinyl = require('vinyl');
const extractCss = require('../index');

function getFile(filePath) {
    return new Vinyl({
        path: path.resolve(filePath),
        cwd: './test/',
        base: path.dirname(filePath),
        contents: Buffer.from(String(fs.readFileSync(filePath)))
    });
}

function compare(fixturePath, expectedHTML, expectedCSS, options, done) {
    const file = getFile(fixturePath);

    options.url = `file://${file.path}`;

    extractCss(file.contents.toString('utf8'), options, (err, html, css) => {
        html.should.be.equal(String(fs.readFileSync(expectedHTML)));
        css.should.be.equal(String(fs.readFileSync(expectedCSS)));

        done();
    });
}

describe('extract-css', () => {
    it('Should separate css and html', done => {
        const options = {
            applyStyleTags: true,
            removeStyleTags: true,
            applyLinkTags: true,
            removeLinkTags: true,
            preserveMediaQueries: false
        };
        compare(
            path.join('test', 'fixtures', 'in.html'),
            path.join('test', 'expected', 'out.html'),
            path.join('test', 'expected', 'file.css'),
            options,
            done
        );
    });

    it('Should handle malformed CSS', done => {
        const options = {
            applyStyleTags: true,
            removeStyleTags: true,
            applyLinkTags: true,
            removeLinkTags: true,
            preserveMediaQueries: false
        };
        compare(
            path.join('test', 'fixtures', 'malformed.html'),
            path.join('test', 'expected', 'malformed.html'),
            path.join('test', 'expected', 'malformed.css'),
            options,
            done
        );
    });

    it('Should ignore code blocks', done => {
        const options = {
            applyStyleTags: true,
            removeStyleTags: true,
            applyLinkTags: true,
            removeLinkTags: true,
            preserveMediaQueries: false
        };
        compare(
            path.join('test', 'fixtures', 'codeblocks.html'),
            path.join('test', 'expected', 'codeblocks.html'),
            path.join('test', 'expected', 'codeblocks.css'),
            options,
            done
        );
    });
});
