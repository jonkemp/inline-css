/* eslint-disable */

const should = require('should');
const fs = require('fs');
const path = require('path');
const Vinyl = require('vinyl');
const getStylesheetList = require('list-stylesheets');
const getHrefContent = require('../index');

function getFile(filePath) {
    return new Vinyl({
        path: path.resolve(filePath),
        cwd: './test/',
        base: path.dirname(filePath),
        contents: Buffer.from(String(fs.readFileSync(filePath)))
    });
}

function compare(fixturePath, expectedPath, options, done) {
    const file = getFile(fixturePath);
    const data = getStylesheetList(file.contents.toString('utf8'), options);

    const url = `file://${file.path}`;

    getHrefContent(data.hrefs[0], url, (err, css) => {
        css.should.be.equal(String(fs.readFileSync(expectedPath)));

        done();
    });
}

describe('href-content', () => {
    it('Should get content from link tags in an HTML document', done => {
        const options = {
            applyLinkTags: true,
            removeLinkTags: true
        };
        compare(path.join('test', 'fixtures', 'in.html'), path.join('test', 'fixtures', 'file.css'), options, done);
    });

    it('Should get content from link tags in in multiple HTML files', done => {
        const options = {
            applyLinkTags: true,
            removeLinkTags: true
        };
        compare(path.join('test', 'fixtures', 'multiple', 'one', 'in.html'), path.join('test', 'fixtures', 'multiple', 'one', 'file.css'), options, () => {});
        compare(path.join('test', 'fixtures', 'multiple', 'two', 'in.html'), path.join('test', 'fixtures', 'multiple', 'two', 'file.css'), options, done);
    });

    it('Should handle malformed CSS', done => {
        const options = {
            applyLinkTags: true,
            removeLinkTags: true
        };
        compare(path.join('test', 'fixtures', 'malformed.html'), path.join('test', 'fixtures', 'malformed.css'), options, done);
    });
});
