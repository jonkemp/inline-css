/*eslint-disable */

const should = require('should');
const fs = require('fs');
const path = require('path');
const mediaQueryText = require('../index');

describe('mediaquery-text', () => {
    it('Should return Media Query text for a CSS source', done => {
        const mediaQueries = mediaQueryText(
            String(fs.readFileSync(path.join(__dirname, 'fixtures', 'file.css')))
        );
        mediaQueries.should.be.equal(
            String(fs.readFileSync(path.join(__dirname, 'expected', 'file.css')))
        );
        done();
    });

    it('Should return Media Query text for a CSS source with @font-face', done => {
        const mediaQueries = mediaQueryText(
            String(fs.readFileSync(path.join(__dirname, 'fixtures', 'font-face.css')))
        );
        mediaQueries.should.be.equal(
            String(fs.readFileSync(path.join(__dirname, 'expected', 'font-face.css')))
        );
        done();
    });
});
