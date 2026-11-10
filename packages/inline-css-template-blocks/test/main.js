/* eslint-disable */
const assert = require('node:assert/strict');
const { protect } = require('../');
describe('template protection', () => {
    for (const [start, end] of [['[[', ']]'], ['($', '$)'], ['\\{', '}\\']]) {
        it(`round trips literal ${start} delimiters`, () => {
            const html = `<p>${start}a\nb${end} {{default}} EXCS_CODE_BLOCK_0_</p>`;
            const protectedHtml = protect(html, { X: { start, end } });
            assert.equal(protectedHtml.restore(protectedHtml.html), html);
            assert.ok(!protectedHtml.html.includes('{{default}}'));
        });
    }
    it('rejects empty delimiters', () => assert.throws(() => protect('x', { X: { start: '', end: ']' } }), { code: 'ERR_INLINE_CSS_INVALID_OPTIONS' }));
    it('prefers the longest opening delimiter for overlaps', () => {
        const result = protect('[[x]]', { A: { start: '[', end: ']' }, B: { start: '[[', end: ']]' } });
        assert.ok(!result.html.includes(']'));
        assert.equal(result.restore(result.html), '[[x]]');
    });
    it('leaves unmatched openers unchanged without hiding other blocks', () => {
        const result = protect('[[ {{x}}', { X: { start: '[[', end: ']]' } });
        assert.equal(result.restore(result.html), '[[ {{x}}');
    });
    it('does not mutate caller blocks', () => {
        const input = Object.freeze({ X: Object.freeze({ start: '[[', end: ']]' }) });
        assert.equal(protect('[[x]]', input).restore(protect('x').html), 'x');
        assert.deepEqual(Object.keys(input), ['X']);
    });
});
