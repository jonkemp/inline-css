const postcss = require('postcss');
const selectors = require('postcss-selector-parser');

module.exports = css => {
    const result = [];

    for (const node of postcss.parse(css).nodes) {
        if (node.type !== 'rule') {
            continue;
        }
        const declarations = node.nodes.filter(child => child.type === 'decl').map((decl, order) => ({ property: decl.prop, value: decl.value, important: Boolean(decl.important), order }));
        const ast = selectors().astSync(node.selector);

        ast.nodes.forEach(selector => result.push({ selector: selector.toString().trim(), declarations }));
    }
    return result;
};
