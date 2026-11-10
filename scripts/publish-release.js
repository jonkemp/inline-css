const { execFileSync } = require('node:child_process');
const { version } = require('../package.json');
const preState = require('../.changeset/pre.json');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const commands = [
    [ 'exec', '--', 'changeset', 'publish' ],
    [ 'publish', '--tag', 'next' ]
];

if (!/^\d+\.\d+\.\d+-rc\.\d+$/.test(version) || preState.mode !== 'pre' || preState.tag !== 'rc') {
    throw new Error('This command publishes release candidates only; stable publication requires a separate reviewed promotion.');
}

// Changesets forbids --tag in prerelease mode: companions use preState.tag (rc).
// The separately versioned root is published under next for consumer RC installs.
for (const args of commands) {
    if (process.argv.includes('--dry-run')) {
        console.log(`${npm} ${args.join(' ')}`);
    } else {
        execFileSync(npm, args, { stdio: 'inherit', shell: process.platform === 'win32' });
    }
}
