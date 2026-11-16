const { randomUUID } = require('node:crypto');

const defaults = { EJS: { start: '<%', end: '%>' }, HBS: { start: '{{', end: '}}' } };
const invalid = () => Object.assign(new Error('codeBlocks must contain nonempty literal start/end strings'), { code: 'ERR_INLINE_CSS_INVALID_OPTIONS' });

exports.protect = (html, codeBlocks = {}) => {
    if (!codeBlocks || typeof codeBlocks !== 'object' || Array.isArray(codeBlocks)) {
        throw invalid();
    }
    const blocks = Object.values({ ...defaults, ...codeBlocks });

    for (const block of blocks) {
        if (!block || typeof block.start !== 'string' || !block.start || typeof block.end !== 'string' || !block.end) {
            throw invalid();
        }
    }
    let prefix;

    do {
        prefix = `excsblock${randomUUID().replaceAll('-', '')}`;
    } while (html.toLowerCase().includes(prefix));
    const saved = [];
    let position = 0;
    let output = '';

    while (position < html.length) {
        const cursor = position;
        const candidates = blocks.map((block, order) => ({ ...block, order, index: html.indexOf(block.start, cursor) }))
            .filter(block => block.index !== -1)
            .sort((a, b) => a.index - b.index || b.start.length - a.start.length || a.order - b.order);
        const block = candidates[0];

        if (!block) {
            output += html.slice(position);
            break;
        }
        const end = html.indexOf(block.end, block.index + block.start.length);

        if (end === -1) {
            output += html.slice(position, block.index + block.start.length);
            position = block.index + block.start.length;
            continue;
        }
        output += html.slice(position, block.index);
        saved.push(html.slice(block.index, end + block.end.length));
        output += `${prefix}n${saved.length - 1}end`;
        position = end + block.end.length;
    }
    return {
        html: output,
        restore: value => value.replace(new RegExp(`${prefix}n(\\d+)end(?:="")?`, 'gi'), (match, index) => saved[Number(index)] ?? match)
    };
};
