/* eslint-disable */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const policy = require('../');
describe('resource policy', () => {
    it('denies network by default and requires exact origins', () => {
        assert.throws(() => policy.authorizeUrl('https://example.com/a', policy.normalizePolicy()), { code: 'ERR_INLINE_CSS_RESOURCE_DENIED' });
        const p = policy.normalizePolicy({ allowedOrigins: ['https://example.com'] });
        assert.equal(policy.authorizeUrl('https://example.com/a', p).hostname, 'example.com');
        assert.throws(() => policy.authorizeUrl('https://example.com.evil/a', p));
        assert.throws(() => policy.authorizeUrl('https://name:secret@example.com/a', p));
        assert.throws(() => policy.authorizeUrl('data:text/css,p{}', p));
    });
    for (const ip of ['127.0.0.1', '169.254.169.254', '10.0.0.1', '[::1]', '[::ffff:127.0.0.1]']) {
        it(`blocks nonpublic ${ip} even with origin permission`, () => {
            const origin = `http://${ip}`;
            assert.throws(() => policy.authorizeUrl(origin, policy.normalizePolicy({ allowedOrigins: [origin] })), { code: 'ERR_INLINE_CSS_RESOURCE_DENIED' });
        });
    }
    it('validates finite limits and leaves inputs unchanged', () => {
        for (const value of [0, -1, NaN, Infinity, 1.5, '4', null]) {
            assert.throws(() => policy.normalizePolicy({ concurrency: value }), { code: 'ERR_INLINE_CSS_INVALID_OPTIONS' });
        }
        const input = Object.freeze({ allowedOrigins: Object.freeze(['https://example.com']) });
        assert.deepEqual(policy.normalizePolicy(input).allowedOrigins, ['https://example.com']);
    });
    it('contains files by canonical paths rather than path prefixes', async () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'inline-policy-'));
        try {
            fs.mkdirSync(path.join(dir, 'root'));
            fs.writeFileSync(path.join(dir, 'outside.css'), 'p{}');
            fs.writeFileSync(path.join(dir, 'root', 'inside.css'), 'p{}');
            fs.symlinkSync(path.join(dir, 'outside.css'), path.join(dir, 'root', 'escape.css'));
            const p = policy.normalizePolicy({ fileRoot: path.join(dir, 'root') });
            assert.equal(await policy.authorizeFile(pathToFileURL(path.join(dir, 'root/inside.css')), p), fs.realpathSync(path.join(dir, 'root/inside.css')));
            await assert.rejects(policy.authorizeFile(pathToFileURL(path.join(dir, 'root/escape.css')), p), { code: 'ERR_INLINE_CSS_RESOURCE_DENIED' });
            await assert.rejects(policy.authorizeFile(pathToFileURL(path.join(dir, 'outside.css')), p), { code: 'ERR_INLINE_CSS_RESOURCE_DENIED' });
        } finally { fs.rmSync(dir, { recursive: true, force: true }); }
    });
});

describe('native root canonicalization', () => {
    it('authorizes a root alias when legacy and native realpath spell it differently', async () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'inline-native-root-'));
        const root = path.join(dir, 'long-root');
        const alias = path.join(dir, 'short-root');
        const legacy = fs.realpathSync;
        try {
            fs.mkdirSync(root);
            fs.writeFileSync(path.join(root, 'inside.css'), 'p{}');
            fs.writeFileSync(path.join(dir, 'outside.css'), 'p{}');
            fs.symlinkSync(root, alias, 'junction');
            // Model Windows legacy realpath retaining an 8.3 alias while native expands it.
            fs.realpathSync = Object.assign(input => path.resolve(input) === alias ? alias : legacy(input), { native: legacy.native });
            const p = policy.normalizePolicy({ fileRoot: alias });
            assert.equal(await policy.authorizeFile(pathToFileURL(path.join(alias, 'inside.css')), p), legacy.native(path.join(root, 'inside.css')));
            await assert.rejects(policy.authorizeFile(pathToFileURL(path.join(dir, 'outside.css')), p), { code: 'ERR_INLINE_CSS_RESOURCE_DENIED' });
        } finally {
            fs.realpathSync = legacy;
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });
});
