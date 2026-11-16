/* eslint-disable */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const cheerio = require('cheerio');
const inline = require('../');

describe('5.0 release regressions', function () {
    let dir;
    before(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'inline-css-regressions-')); });
    after(() => fs.rmSync(dir, { recursive: true, force: true }));
    const options = extra => ({ url: 'https://example.test/email.html', ...extra });
    const run = (html, extra) => inline(html, options(extra));
    const dom = html => cheerio.load(html);
    function sheet(css, filename = 'style.css') {
        const file = path.join(dir, filename);
        fs.writeFileSync(file, css);
        return pathToFileURL(file).href;
    }
    const permitted = () => ({ resourcePolicy: { fileRoot: dir } });
    it('1 denies unpermitted local stylesheet reads', async () => {
        await assert.rejects(run(`<link rel="stylesheet" href="${sheet('p{color:red}')}"><p>x</p>`), { code: 'ERR_INLINE_CSS_RESOURCE_DENIED' });
    });
    it('3 enforces the per-stylesheet decoded byte limit', async () => {
        await assert.rejects(run(`<link rel="stylesheet" href="${sheet('p{color:red}')}"/>`, { resourcePolicy: { fileRoot: dir, maxStylesheetBytes: 4 } }), { code: 'ERR_INLINE_CSS_RESOURCE_LIMIT' });
    });
    it('3 rejects excessive stylesheet load counts', async () => {
        const href = sheet('p{color:red}');
        await assert.rejects(run(`<link rel="stylesheet" href="${href}"><link rel="stylesheet" href="${href}">`, { resourcePolicy: { fileRoot: dir, maxStylesheets: 1 } }), { code: 'ERR_INLINE_CSS_RESOURCE_LIMIT' });
    });
    it('4 retains important selector specificity', async () => {
        const $ = dom(await run('<style>#x{color:red!important}p{color:blue!important}</style><p id="x">x</p>'));
        assert.equal($('p').css('color'), 'red !important');
    });
    it('4 inline important beats stylesheet important', async () => {
        const $ = dom(await run('<style>#x{color:blue!important}</style><p id="x" style="color:red!important">x</p>'));
        assert.equal($('p').css('color'), 'red !important');
    });
    it('5 later shorthand resets an earlier longhand', async () => {
        const $ = dom(await run('<style>p{margin-left:10px;margin:0}</style><p>x</p>'));
        const style = $('p').attr('style');
        assert.ok(!style.includes('margin-left') || style.indexOf('margin-left') < style.lastIndexOf('margin:'));
    });
    it('5 preserves duplicate fallback declarations', async () => {
        const $ = dom(await run('<style>p{display:-webkit-box;display:flex}</style><p>x</p>'));
        assert.match($('p').attr('style'), /display: -webkit-box;.*display: flex;/);
    });
    it('6 linked and embedded styles retain document order', async () => {
        const $ = dom(await run(`<link rel="stylesheet" href="${sheet('p{color:red}')}"><style>p{color:blue}</style><p>x</p>`, permitted()));
        assert.equal($('p').css('color'), 'blue');
    });
    it('8 specificity ten classes beats two classes', async () => {
        const $ = dom(await run('<style>.a.a.a.a.a.a.a.a.a.a{color:red}.a.a{color:blue}</style><p class="a">x</p>'));
        assert.equal($('p').css('color'), 'red');
    });
    it('9 accepts empty style elements between nonempty styles', async () => {
        const $ = dom(await run('<style></style><style>p{color:red}</style><style> </style><p>x</p>'));
        assert.equal($('p').css('color'), 'red');
    });
    it('10 selector lists do not inherit another branch specificity', async () => {
        const $ = dom(await run('<style>:is(#absent,.a),.c{color:red}.b{color:blue}</style><p class="b c">x</p>'));
        assert.equal($('p').css('color'), 'blue');
    });
    it('B11 style media remains conditional', async () => {
        const $ = dom(await run('<style media="print">p{color:red}</style><p>x</p>', { preserveMediaQueries: true }));
        assert.equal($('p').attr('style'), undefined);
        assert.match($('style').text(), /@media print/);
    });
    it('B11 linked media remains conditional', async () => {
        const $ = dom(await run(`<link rel="stylesheet" media="print" href="${sheet('p{color:red}')}"><p>x</p>`, { ...permitted(), preserveMediaQueries: true }));
        assert.equal($('p').attr('style'), undefined);
        assert.match($('style').text(), /@media print/);
    });
    it('B12 retains linked media alongside unconditional CSS', async () => {
        const $ = dom(await run(`<link rel="stylesheet" href="${sheet('p{color:red}@media(max-width:600px){.x{color:blue}}')}"><p class="x">x</p>`, { ...permitted(), preserveMediaQueries: true }));
        assert.equal($('p').css('color'), 'red');
        assert.match($('style').text(), /max-width:600px/);
        assert.match($('style').text(), /color:blue|color: blue/);
    });
    it('B12 retains extraCss media', async () => {
        const $ = dom(await run('<p>x</p>', { extraCss: '@media print{p{color:red}}', preserveMediaQueries: true }));
        assert.match($('style').text(), /@media print/);
        assert.equal($('p').attr('style'), undefined);
    });
    it('B14 rejects selector stripping when CSS is retained', async () => {
        await assert.rejects(run('<style>p{color:red}@media screen{.x{color:blue}}</style><p class="x">x</p>', { preserveMediaQueries: true, removeHtmlSelectors: true }), { code: 'ERR_INLINE_CSS_SELECTOR_RETENTION_CONFLICT' });
    });
    it('B14 allows selector stripping without retained CSS', async () => {
        const $ = dom(await run('<style>.x{color:red}</style><p class="x">x</p>', { removeHtmlSelectors: true }));
        assert.equal($('p').attr('class'), undefined);
        assert.equal($('p').css('color'), 'red');
    });
    it('B16 treats custom delimiters literally', async () => {
        const result = await run('<p>[[ value ]] {{default}}</p>', { codeBlocks: { X: { start: '[[', end: ']]' } } });
        assert.match(result, /\[\[ value \]\] \{\{default\}\}/);
    });
    it('B17 preserves literal placeholder-shaped input', async () => {
        const $ = dom(await run('<p>EXCS_CODE_BLOCK_0_ {{value}}</p>'));
        assert.equal($('p').text(), 'EXCS_CODE_BLOCK_0_ {{value}}');
    });
    for (const property of ['constructor', 'toString', '__proto__']) {
        it(`B18 ${property} does not suppress valid declarations`, async () => {
            const $ = dom(await run(`<style>p{${property}:red;color:blue}</style><p>x</p>`));
            assert.equal($('p').css('color'), 'blue');
            assert.equal({}.polluted, undefined);
        });
    }
    it('invalid known options reject as Error objects before I/O', async () => {
        await assert.rejects(run('<p>x</p>', { resourcePolicy: { timeoutMs: 0 } }), { code: 'ERR_INLINE_CSS_INVALID_OPTIONS' });
    });
});
