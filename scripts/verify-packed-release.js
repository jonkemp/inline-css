const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { spawn, execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'inline-css-packed-'));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const run = (command, args, cwd) => new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, shell: process.platform === 'win32', stdio: [ 'ignore', 'pipe', 'pipe' ] });
    let output = '';

    child.stdout.on('data', data => {
        output += data;
    });
    child.stderr.on('data', data => {
        output += data;
    });
    child.on('error', reject);
    child.on('exit', code => code ? reject(new Error(`${command} exited ${code}\n${output.slice(-5000)}`)) : resolve(output));
});

(async () => {
    let server;

    try {
        const dirs = [ root, ...fs.readdirSync(path.join(root, 'packages')).map(name => path.join(root, 'packages', name)) ];
        const packages = new Map();

        for (const dir of dirs) {
            const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
            const result = JSON.parse(execFileSync(npm, [ 'pack', '--json', '--ignore-scripts', '--pack-destination', scratch ], { cwd: dir, encoding: 'utf8', shell: process.platform === 'win32' }))[0];

            assert.ok(result.files.some(file => file.path === manifest.main), `${manifest.name}: missing entry point`);
            assert.ok(result.files.some(file => file.path === 'LICENSE'), `${manifest.name}: missing license`);
            assert.ok(!result.files.some(file => /^(test|node_modules|coverage)\//.test(file.path)), `${manifest.name}: unexpected packed files`);
            packages.set(manifest.name, { manifest, result });
        }
        server = http.createServer((req, res) => {
            const pathname = decodeURIComponent(new URL(req.url, 'http://registry.test').pathname).slice(1);
            const item = packages.get(pathname);

            if (item) {
                const manifest = { ...item.manifest, dist: { tarball: `http://127.0.0.1:${server.address().port}/tarballs/${item.result.filename}`, integrity: item.result.integrity } };

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ name: manifest.name, 'dist-tags': { latest: manifest.version }, versions: { [manifest.version]: manifest } }));
            } else if (pathname.startsWith('tarballs/')) {
                const filename = path.basename(pathname);

                if (![ ...packages.values() ].some(pkg => pkg.result.filename === filename)) {
                    res.writeHead(404).end();
                    return;
                }
                fs.createReadStream(path.join(scratch, filename)).pipe(res);
            } else {
                res.writeHead(307, { Location: `https://registry.npmjs.org/${pathname}` }).end();
            }
        });
        await new Promise((resolve, reject) => {
            server.once('error', reject);
            server.listen(0, '127.0.0.1', resolve);
        });
        const consumer = path.join(scratch, 'consumer');

        fs.mkdirSync(consumer);
        fs.writeFileSync(path.join(consumer, 'package.json'), JSON.stringify({ name: 'release-consumer', private: true, version: '1.0.0' }));
        const registry = `http://127.0.0.1:${server.address().port}`;
        const rootPackage = packages.get('inline-css');

        // No overrides, workspace links, or pre-existing consumer lockfile: resolve published ranges.
        await run(npm, [ 'install', path.join(scratch, rootPackage.result.filename), '--ignore-scripts', '--engine-strict', '--no-audit', '--no-fund', '--registry', registry, '--cache', path.join(os.tmpdir(), 'inline-css-npm-cache') ], consumer);
        for (const [ name, item ] of packages) {
            const installed = path.join(consumer, 'node_modules', name);

            assert.ok(!fs.lstatSync(installed).isSymbolicLink(), `${name}: workspace symlink leaked`);
            assert.equal(JSON.parse(fs.readFileSync(path.join(installed, 'package.json'))).version, item.manifest.version);
        }
        process.stdout.write(await run(process.execPath, [ '-e', `${JSON.stringify([ ...packages.keys() ])}.forEach(name => require(name)); console.log('All standalone packed entry points load.');` ], consumer));
        const smoke = `
            const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
            const inline=require('inline-css');
            (async()=>{
                const options={url:'https://example.test/'};
                assert.match(await inline('<style>p{color:red}</style><p>x</p>',options),/color: red/);
                const file=path.join(process.cwd(),'style.css');fs.writeFileSync(file,'p{color:blue}@media print{p{color:red}}');
                const html='<link rel="stylesheet" href="'+pathToFileURL(file).href+'"><p>x</p>';
                await assert.rejects(inline(html,options),{code:'ERR_INLINE_CSS_RESOURCE_DENIED'});
                assert.match(await inline(html,{...options,preserveMediaQueries:true,resourcePolicy:{fileRoot:process.cwd()}}),/@media print/);
                assert.match(await inline('<p>EXCS_CODE_BLOCK_0_ [[v]] {{x}}</p>',{...options,codeBlocks:{X:{start:'[[',end:']]'}}}),/EXCS_CODE_BLOCK_0_ \\[\\[v\\]\\]/);
                assert.match(await inline('<style>p{constructor:red;color:blue}</style><p>x</p>',options),/color: blue/);
                await assert.rejects(inline('<style data-embed>.x{color:red}</style><p class="x">x</p>',{...options,removeHtmlSelectors:true}),{code:'ERR_INLINE_CSS_SELECTOR_RETENTION_CONFLICT'});
                console.log('Packed consumer smoke passed on '+process.version);
            })().catch(e=>{console.error(e);process.exitCode=1});
        `;

        fs.writeFileSync(path.join(consumer, 'smoke.cjs'), smoke);
        process.stdout.write(await run(process.execPath, [ 'smoke.cjs' ], consumer));
        console.log(`Verified ${packages.size} tarballs and no-lockfile semver resolution through a local registry.`);
        if (process.env.INLINE_CSS_KEEP_CONSUMER) {
            console.log(`Retained consumer: ${consumer}`);
        }
    } finally {
        if (server) {
            server.closeAllConnections();
            await new Promise(resolve => server.close(resolve));
        }
        if (!process.env.INLINE_CSS_KEEP_CONSUMER) {
            fs.rmSync(scratch, { recursive: true, force: true });
        }
    }
})().catch(cause => {
    console.error(cause); process.exitCode = 1;
});
