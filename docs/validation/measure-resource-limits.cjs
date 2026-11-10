/* Analysis harness for the 5.0 proposal; does not implement/enforce its limits. */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { pathToFileURL, fileURLToPath } = require('node:url');
const { performance } = require('node:perf_hooks');
const cheerio = require('cheerio');
const inlineCss = require('../../');

const sampleRoot = process.argv[2];
if (!sampleRoot) throw new Error('Usage: node docs/validation/measure-resource-limits.cjs SAMPLE_DIRECTORY');
const root = path.resolve(__dirname, '../..');
const manifest = JSON.parse(fs.readFileSync(path.join(sampleRoot, 'manifest.json'), 'utf8'));
const samples = manifest.flatMap(repo => repo.samples);
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'inline-css-limit-analysis-'));
const results = [];

function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const dest = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(dest) : [ dest ];
    });
}

async function measure(name, html, baseUrl, resolveHref, category) {
    const $ = cheerio.load(html);
    const embedded = $('style').toArray().map(el => $(el).html() || '');
    const hrefs = $('link[rel="stylesheet"]').toArray().map(el => $(el).attr('href'));
    const loaded = hrefs.map(href => resolveHref(href));
    const missing = hrefs.filter((_, index) => !loaded[index]);
    const bytes = loaded.filter(Boolean).map(file => fs.statSync(file).size);
    const row = {
        name, category, htmlBytes: Buffer.byteLength(html), embeddedCssBytes: embedded.reduce((n, css) => n + Buffer.byteLength(css), 0),
        externalStylesheets: hrefs.length, maxStylesheetBytes: Math.max(0, ...bytes), totalStylesheetBytes: bytes.reduce((a, b) => a + b, 0),
        projectionPass: !missing.length && bytes.every(n => n <= 1048576) && bytes.reduce((a, b) => a + b, 0) <= 10485760 && hrefs.length <= 32
    };
    if (missing.length) {
        row.skipped = 'Unresolved or remote resource; no network attempted';
    } else {
        $('link[rel="stylesheet"]').each((i, el) => {
            const copy = path.join(scratch, `load-${results.length}-${i}.css`);
            fs.copyFileSync(loaded[i], copy);
            $(el).attr('href', pathToFileURL(copy).href);
        });
        const prepared = $.html();
        try {
            await inlineCss(prepared, { url: baseUrl, resourcePolicy: { fileRoot: scratch } });
            const durations = [];
            for (let i = 0; i < 5; i++) {
                const start = performance.now();
                await inlineCss(prepared, { url: baseUrl, resourcePolicy: { fileRoot: scratch } });
                durations.push(performance.now() - start);
            }
            durations.sort((a, b) => a - b);
            row.conversionMedianMs = Number(durations[2].toFixed(2));
            row.conversionMaxMs = Number(durations[4].toFixed(2));
        } catch (error) { row.error = String(error); }
    }
    results.push(row);
}

(async () => {
    try {
        const fixtureRoots = [ path.join(root, 'test/fixtures'), ...fs.readdirSync(path.join(root, 'packages')).map(p => path.join(root, 'packages', p, 'test/fixtures')).filter(p => fs.existsSync(p)) ];
        for (const dir of fixtureRoots) {
            for (const file of walk(dir).filter(p => p.endsWith('.html'))) {
                const base = pathToFileURL(file).href;
                await measure(path.relative(root, file), fs.readFileSync(file, 'utf8'), base, href => {
                    try {
                        const url = new URL(href, base);
                        return url.protocol === 'file:' && fs.existsSync(fileURLToPath(url)) ? fileURLToPath(url) : null;
                    } catch { return null; }
                }, 'repository-fixture');
            }
        }
        for (const sample of samples.filter(s => s.path.endsWith('.html'))) {
            const html = fs.readFileSync(path.join(sampleRoot, sample.localFile), 'utf8');
            const base = `https://raw.githubusercontent.com/${sample.repo}/${sample.sha}/${sample.path}`;
            const resolve = href => {
                try {
                    const target = new URL(href, base).href;
                    const found = samples.find(s => target === `https://raw.githubusercontent.com/${s.repo}/${s.sha}/${s.path}`);
                    return found ? path.join(sampleRoot, found.localFile) : null;
                } catch { return null; }
            };
            await measure(`${sample.repo}/${sample.path}`, html, base, resolve, 'public-email');
            // Derived workload: same real embedded CSS, served as local stylesheets.
            // This tests the resource-size/count projection, not real network latency.
            const $ = cheerio.load(html);
            $('style').each((i, el) => {
                const file = path.join(scratch, `${sample.localFile}-${i}.css`);
                fs.writeFileSync(file, $(el).html() || '');
                $(el).replaceWith($('<link rel="stylesheet">').attr('href', pathToFileURL(file).href));
            });
            await measure(`${sample.repo}/${sample.path} (externalized embedded CSS)`, $.html(), base, href => href.startsWith('file:') ? fileURLToPath(href) : resolve(href), 'derived-local-load');
        }
        const framework = samples.find(s => s.path.endsWith('foundation-emails.css'));
        if (framework) {
            const file = path.join(sampleRoot, framework.localFile);
            await measure(`${framework.repo}/${framework.path} (minimal HTML harness)`, `<link rel="stylesheet" href="${pathToFileURL(file).href}"><table class="body"><tr><td>Example</td></tr></table>`, 'https://example.com/email.html', () => file, 'derived-local-load');
        }
        const completed = results.filter(r => r.conversionMaxMs !== undefined);
        const publicRows = results.filter(r => r.category === 'public-email');
        const projected = results.filter(r => r.category !== 'repository-fixture');
        console.log(JSON.stringify({
            node: process.version, packageVersion: require('../../package.json').version,
            methodology: 'One warmup plus five sequential conversions per input using the current checkout and finite default limits with an explicitly authorized scratch file root; all resource reads local; timing is whole conversion, not loading deadline; rendering not asserted.',
            summary: {
                repositoryInputs: results.filter(r => r.category === 'repository-fixture').length,
                publicEmails: publicRows.length, derivedInputs: results.filter(r => r.category === 'derived-local-load').length,
                completedInputs: completed.length, errors: results.filter(r => r.error).length, skipped: results.filter(r => r.skipped).length,
                publicProjectionPasses: projected.filter(r => r.projectionPass).length, publicProjectionInputs: projected.length,
                maxExternalStylesheets: Math.max(...projected.map(r => r.externalStylesheets)), maxStylesheetBytes: Math.max(...projected.map(r => r.maxStylesheetBytes)),
                maxTotalStylesheetBytes: Math.max(...projected.map(r => r.totalStylesheetBytes)), maxLocalConversionMs: Math.max(...completed.map(r => r.conversionMaxMs))
            }, sources: manifest, results
        }, null, 2));
    } finally { fs.rmSync(scratch, { recursive: true, force: true }); }
})().catch(error => { console.error(error); process.exitCode = 1; });
