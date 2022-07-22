/* eslint-disable */

const should = require('should');
const fs = require('fs');
const path = require('path');
const Vinyl = require('vinyl');
const beautify = require('js-beautify').html;
const getStylesheetList = require('../index');

function getFile(filePath) {
    return new Vinyl({
        path: path.resolve(filePath),
        cwd: './test/',
        base: path.dirname(filePath),
        contents: Buffer.from(String(fs.readFileSync(filePath)))
    });
}

describe('list-stylesheets', () => {
    it('Should list stylesheets from an html file', done => {
        const options = {
            applyLinkTags: true,
            removeLinkTags: true
        };

        function compare(fixturePath, expectedHTML) {
            const file = getFile(fixturePath);
            const data = getStylesheetList(file.contents.toString('utf8'), options);

            data.hrefs[0].should.be.equal('file.css');
            beautify(data.html).should.be.equal(
                beautify(String(fs.readFileSync(expectedHTML)))
            );
            done();
        }

        compare(
            path.join(__dirname, 'fixtures', 'in.html'),
            path.join(__dirname, 'expected', 'out.html'),
            options,
            done
        );
    });

    it('Should ignore hbs code blocks', done => {
        const options = {
            applyLinkTags: true,
            removeLinkTags: true
        };

        function compare(fixturePath, expectedHTML) {
            const file = getFile(fixturePath);
            const data = getStylesheetList(file.contents.toString('utf8'), options);

            data.hrefs[0].should.be.equal('codeblocks.css');
            data.html.replace(/(\r\n|\n|\r)/gm, "")
                .should.be.equal(
                    String(fs.readFileSync(expectedHTML)).replace(/(\r\n|\n|\r)/gm, ""));
            done();
        }

        compare(
            path.join(__dirname, 'fixtures', 'codeblocks.html'),
            path.join(__dirname, 'expected', 'codeblocks.html'),
            options,
            done
        );
    });

    it('Should ignore ejs code blocks', done => {
        const options = {
            applyLinkTags: true,
            removeLinkTags: true
        };

        function compare(fixturePath, expectedHTML) {
            const file = getFile(fixturePath);
            const data = getStylesheetList(file.contents.toString('utf8'), options);

            data.hrefs[0].should.be.equal('ejs.css');
            data.html.replace(/(\r\n|\n|\r)/gm, "")
                .should.be.equal(
                    String(fs.readFileSync(expectedHTML)).replace(/(\r\n|\n|\r)/gm, ""));
            done();
        }

        compare(
            path.join(__dirname, 'fixtures', 'ejs.html'),
            path.join(__dirname, 'expected', 'ejs.html'),
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

        function compare(fixturePath, expectedHTML) {
            const file = getFile(fixturePath);
            const data = getStylesheetList(file.contents.toString('utf8'), options);

            data.html.replace(/(\r\n|\n|\r)/gm, "")
                .should.be.equal(
                    String(fs.readFileSync(expectedHTML)).replace(/(\r\n|\n|\r)/gm, ""));
            done();
        }

        compare(
            path.join(__dirname, 'fixtures', 'codeblocks-external.html'),
            path.join(__dirname, 'expected', 'codeblocks-external.html'),
            options,
            done
        );
    });
});
