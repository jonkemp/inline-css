const { spawnSync } = require('node:child_process');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
let failed = false;

for (const production of [ false, true ]) {
    const args = [ 'audit', '--json', ...(production ? [ '--omit=dev' ] : []) ];
    const result = spawnSync(npm, args, { encoding: 'utf8', shell: process.platform === 'win32', maxBuffer: 10 * 1024 * 1024 });
    let report;

    try {
        report = JSON.parse(result.stdout);
    } catch (cause) {
        throw new Error('Dependency audit did not return usable JSON', { cause });
    }
    if (!report.metadata || report.error || result.error) {
        throw new Error(`Dependency audit unavailable: ${report.error?.message || result.error || result.stderr}`);
    }
    const counts = report.metadata.vulnerabilities;

    console.log(`${production ? 'Production' : 'All'} dependency audit: ${JSON.stringify(counts)}`);
    if (counts.high || counts.critical || (production && counts.total)) {
        failed = true;
    }
}
process.exitCode = failed ? 1 : 0;
