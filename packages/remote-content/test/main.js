/*eslint-disable */

const should = require('should');
const fs = require('fs');
const path = require('path');
const getRemoteContent = require('../index');

function compare(remotePath, fixturePath, done) {
    getRemoteContent(remotePath, (err, css) => {
        css.should.be.equal(String(fs.readFileSync(fixturePath)));

        done();
    });
}

describe('remote-content', function() {
    this.timeout(15000);

    it('Should get remote content from link tags in an HTML document', done => {
        compare('https://raw.githubusercontent.com/jonkemp/remote-content/master/test/fixtures/file.css', path.join('test', 'fixtures', 'file.css'), done);
    });
});
