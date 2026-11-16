const { randomUUID } = require('node:crypto');

const defaults = { EJS: { start: '<%', end: '%>' }, HBS: { start: '{{', end: '}}' } };
const invalid = () => Object.assign(new Error('codeBlocks must contain nonempty literal start/end strings'), { code: 'ERR_INLINE_CSS_INVALID_OPTIONS' });
const isDelimiter = value => typeof value === 'string' && value.length > 0;
const validateBlock = block => {
    if (!block || !isDelimiter(block.start) || !isDelimiter(block.end)) {
        throw invalid();
    }
    return block;
};
const getBlocks = codeBlocks => {
    if (!codeBlocks || typeof codeBlocks !== 'object' || Array.isArray(codeBlocks)) {
        throw invalid();
    }
    return Object.values({ ...defaults, ...codeBlocks }).map(validateBlock);
};
const createPrefix = html => {
    let prefix;

    do {
        prefix = `excsblock${randomUUID().replaceAll('-', '')}`;
    } while (html.toLowerCase().includes(prefix));
    return prefix;
};
const nextBlock = (html, blocks, position) => blocks
    .map((block, order) => ({ ...block, order, index: html.indexOf(block.start, position) }))
    .filter(block => block.index !== -1)
    .sort((a, b) => a.index - b.index || b.start.length - a.start.length || a.order - b.order)[0];

const encode = (html, blocks, prefix) => {
    const saved = [];
    let position = 0;
    let output = '';

    while (position < html.length) {
        const block = nextBlock(html, blocks, position);

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
    return { output, saved };
};

exports.protect = (html, codeBlocks = {}) => {
    const blocks = getBlocks(codeBlocks);
    const prefix = createPrefix(html);
    const { output, saved } = encode(html, blocks, prefix);

    return {
        html: output,
        restore: value => value.replace(new RegExp(`${prefix}n(\\d+)end(?:="")?`, 'gi'), (match, index) => saved[Number(index)] ?? match)
    };
};
