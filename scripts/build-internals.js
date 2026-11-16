const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const consumers = {
    'inline-css': [ 'resource-policy', 'template-blocks' ],
    'extract-css': [ 'resource-policy', 'template-blocks' ],
    'href-content': [ 'resource-policy' ],
    'remote-content': [ 'resource-policy' ],
    'list-stylesheets': [ 'template-blocks' ],
    'style-data': [ 'template-blocks' ]
};

const build = (selected = Object.keys(consumers)) => {
    for (const name of selected) {
        if (!Object.hasOwn(consumers, name)) {
            throw new Error(`Unknown internal-helper consumer: ${name}`);
        }
        const dir = name === 'inline-css' ? root : path.join(root, 'packages', name);
        const output = path.join(dir, 'lib', 'internal');

        fs.mkdirSync(output, { recursive: true });
        for (const helper of consumers[name]) {
            fs.copyFileSync(path.join(root, 'internal', `${helper}.js`), path.join(output, `${helper}.js`));
        }
    }
};

module.exports = build;
if (require.main === module) {
    build(process.argv.length > 2 ? process.argv.slice(2) : undefined);
}
