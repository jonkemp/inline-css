/* eslint-disable */
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
describe('cross-platform test discovery', function () {
    this.timeout(10000);
    it('discovers workspace tests without shell glob expansion', () => {
        const script = require('../package.json').scripts.test;
        const args = script.match(/"[^"]*"|\S+/g).slice(1).map(arg => arg.replace(/^"|"$/g, ''));
        const child = spawnSync(process.execPath, [path.resolve(__dirname, '../node_modules/mocha/bin/mocha.js'), ...args, '--dry-run', '--reporter=json'], {encoding:'utf8', maxBuffer:10*1024*1024});
        assert.equal(child.status, 0, child.stderr);
        const titles = JSON.parse(child.stdout).tests.map(test => test.fullTitle);
        for (const suite of ['resource policy ', 'template protection ', 'ordered CSS rules ', 'style-data 5.0 callbacks and conditions ']) {
            assert.ok(titles.some(title => title.startsWith(suite)), `Missing workspace suite: ${suite}`);
        }
    });
});
