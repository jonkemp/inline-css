/* eslint-disable */
const assert = require('node:assert/strict');
const http = require('node:http');
const zlib = require('node:zlib');
const dns = require('node:dns');
const inline = require('../');
const remote = require('remote-content');
const policyModule = require('resource-policy');

describe('5.0 bounded resource integration', function () {
    this.timeout(5000);
    let server, origin, active, peak, calls, proxyCalls;
    before(async () => {
        server = http.createServer((req, res) => {
            calls.push(req.url);
            if (req.url.startsWith('http')) { proxyCalls++; res.end('p{color:purple}'); return; }
            if (req.url === '/redirect') { res.writeHead(302, { Location: '/plain' }); res.end(); return; }
            if (req.url === '/off-origin') { res.writeHead(302, { Location: 'http://localhost:1/private' }); res.end(); return; }
            if (req.url === '/loop') { res.writeHead(302, { Location: '/loop' }); res.end(); return; }
            if (req.url === '/compressed') { res.writeHead(200, { 'Content-Encoding': 'gzip' }); res.end(zlib.gzipSync('p{color:red}' + ' '.repeat(4096))); return; }
            if (req.url === '/headers') return;
            if (req.url === '/stall') { res.writeHead(200); res.write('p{'); return; }
            if (req.url === '/empty-reason') { res.writeHead(200, ''); res.end('p{color:red}'); return; }
            if (req.url.startsWith('/delayed')) {
                active++; peak = Math.max(active, peak);
                setTimeout(() => { active--; res.end('p{color:red}'); }, 35);
                return;
            }
            if (req.url === '/blue') { res.end('p{color:blue}'); return; }
            if (req.url === '/credential-check' && req.headers.authorization) { res.end('p{color:purple}'); return; }
            res.end('p{color:red}');
        });
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        origin = `http://127.0.0.1:${server.address().port}`;
    });
    after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
    beforeEach(() => { active = 0; peak = 0; calls = []; proxyCalls = 0; });
    const opts = changes => ({ url: 'https://example.test/email', resourcePolicy: { allowedOrigins: [origin], allowPrivateNetworks: true, ...changes } });
    const html = (...urls) => urls.map(url => `<link rel="stylesheet" href="${origin}${url}">`).join('') + '<p>x</p>';
    it('allows authorized loading and numeric 200 without reason phrase', async () => {
        assert.match(await inline(html('/empty-reason'), opts()), /color: red/);
    });
    it('absolute hrefs work even with a relative documented base', async () => {
        assert.match(await inline(html('/plain'), { ...opts(), url: './' }), /color: red/);
    });
    it('redirects must remain authorized', async () => {
        await assert.rejects(inline(html('/off-origin'), opts()), { code: 'ERR_INLINE_CSS_RESOURCE_DENIED' });
        assert.deepEqual(calls, ['/off-origin']);
    });
    it('accepts a redirect at the exact budget', async () => assert.match(await inline(html('/redirect'), opts({ maxRedirects: 1 })), /color: red/));
    it('rejects the next redirect beyond the budget', async () => {
        await assert.rejects(inline(html('/loop'), opts({ maxRedirects: 1 })), { code: 'ERR_INLINE_CSS_RESOURCE_LIMIT' });
        assert.equal(calls.length, 2);
    });
    it('enforces decoded bytes on compressed responses', async () => {
        await assert.rejects(inline(html('/compressed'), opts({ maxStylesheetBytes: 1024 })), { code: 'ERR_INLINE_CSS_RESOURCE_LIMIT' });
    });
    it('accepts the exact byte boundary and rejects one byte over', async () => {
        assert.match(await inline(html('/plain'), opts({ maxStylesheetBytes: 12 })), /red/);
        await assert.rejects(inline(html('/plain'), opts({ maxStylesheetBytes: 11 })), { code: 'ERR_INLINE_CSS_RESOURCE_LIMIT' });
    });
    it('enforces a shared aggregate byte budget', async () => {
        await assert.rejects(inline(html('/plain', '/plain'), opts({ maxTotalBytes: 23 })), { code: 'ERR_INLINE_CSS_RESOURCE_LIMIT' });
        assert.match(await inline(html('/plain', '/plain'), opts({ maxTotalBytes: 24 })), /red/);
    });
    for (const route of ['/headers', '/stall']) {
        it(`times out ${route} with a stable reason`, async () => {
            await assert.rejects(inline(html(route), opts({ timeoutMs: 50 })), { code: 'ERR_INLINE_CSS_RESOURCE_TIMEOUT' });
        });
    }
    it('bounds concurrent loads and preserves all queued work', async () => {
        await inline(html('/delayed1', '/delayed2', '/delayed3', '/delayed4'), opts({ concurrency: 2 }));
        assert.equal(calls.length, 4);
        assert.equal(peak, 2);
    });
    it('completion order cannot reverse stylesheet source order', async () => {
        const result = await inline(html('/delayed-red', '/blue'), opts());
        const $ = require('cheerio').load(result);
        assert.equal($('p').css('color'), 'blue');
    });
    it('default load-count boundary accepts 32 and rejects 33 without I/O', async () => {
        await inline(html(...Array(32).fill('/plain')), opts());
        assert.equal(calls.length, 32);
        calls = [];
        await assert.rejects(inline(html(...Array(33).fill('/plain')), opts()), { code: 'ERR_INLINE_CSS_RESOURCE_LIMIT' });
        assert.equal(calls.length, 0);
    });
    it('deadline includes queue time, not a fresh timeout for each request', async () => {
        await assert.rejects(inline(html('/delayed1', '/delayed2', '/delayed3'), opts({ concurrency: 1, timeoutMs: 50 })), { code: 'ERR_INLINE_CSS_RESOURCE_TIMEOUT' });
        assert.ok(calls.length < 3);
    });
    it('first failure cancels queued work', async () => {
        await assert.rejects(inline(html('/off-origin', '/plain', '/plain'), opts({ concurrency: 1 })), { code: 'ERR_INLINE_CSS_RESOURCE_DENIED' });
        assert.deepEqual(calls, ['/off-origin']);
    });
    it('disabled fetching does not authorize or load links', async () => {
        await inline(html('/plain'), { url: origin, applyLinkTags: false });
        assert.equal(calls.length, 0);
    });
    it('standalone loader denies access and invokes its callback once', async () => {
        let count = 0;
        await new Promise((resolve, reject) => remote(`${origin}/plain`, {}, err => {
            count++;
            try { assert.equal(err.code, 'ERR_INLINE_CSS_RESOURCE_DENIED'); resolve(); } catch (e) { reject(e); }
        }));
        await new Promise(resolve => setTimeout(resolve, 10));
        assert.equal(count, 1);
        assert.equal(calls.length, 0);
    });
    it('proxy environment cannot intercept the direct request', async () => {
        const keys = ['HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','NO_PROXY','http_proxy','https_proxy','all_proxy','no_proxy'];
        const saved = keys.map(key => process.env[key]);
        try {
            keys.forEach(key => { process.env[key] = key.toLowerCase() === 'no_proxy' ? '' : origin; });
            await inline(html('/plain'), opts());
            assert.equal(proxyCalls, 0);
            assert.deepEqual(calls, ['/plain']);
            assert.equal(process.env.HTTP_PROXY, origin);
        } finally { keys.forEach((key, index) => { if (saved[index] === undefined) delete process.env[key]; else process.env[key] = saved[index]; }); }
    });
    it('does not inherit global Axios authentication defaults', async () => {
        const axios = require('axios');
        const previous = axios.defaults.headers.common.Authorization;
        try {
            axios.defaults.headers.common.Authorization = 'Bearer unrelated-application-secret';
            const result = await inline(html('/credential-check'), opts());
            assert.ok(!result.includes('purple'));
            assert.match(result, /red/);
        } finally {
            if (previous === undefined) delete axios.defaults.headers.common.Authorization;
            else axios.defaults.headers.common.Authorization = previous;
        }
    });
    it('checks every DNS answer and returns only validated addresses to the socket', async () => {
        const saved = dns.lookup;
        try {
            dns.lookup = (host, options, callback) => callback(null, [{ address: '93.184.216.34', family: 4 }, { address: '127.0.0.1', family: 4 }]);
            await assert.rejects(new Promise((resolve, reject) => policyModule.createLookup(policyModule.normalizePolicy())('test.invalid', { all: true }, (err, value) => err ? reject(err) : resolve(value))), { code: 'ERR_INLINE_CSS_RESOURCE_DENIED' });
            dns.lookup = (host, options, callback) => callback(null, [{ address: '93.184.216.34', family: 4 }]);
            const addresses = await new Promise((resolve, reject) => policyModule.createLookup(policyModule.normalizePolicy())('test.invalid', { all: true }, (err, value) => err ? reject(err) : resolve(value)));
            assert.deepEqual(addresses, [{ address: '93.184.216.34', family: 4 }]);
        } finally { dns.lookup = saved; }
    });
});
