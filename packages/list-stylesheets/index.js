const jsdom = require('jsdom');
const { JSDOM } = jsdom;

function replaceCodeBlock(html, re, block) {
    return html.replace(re, () => block);
}

function decodeHTMLEntities(str) {
    return String(str).replace(/&amp;/g, '&');
}

module.exports = (html, options) => {
    const results = {};
    const codeBlocks = {
        EJS: { start: '<%', end: '%>' },
        HBS: { start: '{{', end: '}}' }
    };
    const codeBlockLookup = [];
    const encodeCodeBlocks = _html => {
        let __html = _html;
        const blocks = Object.assign(codeBlocks, options.codeBlocks);

        Object.keys(blocks).forEach(key => {
            const re = new RegExp(blocks[key].start + '([\\S\\s]*?)' + blocks[key].end, 'g');

            __html = __html.replace(re, match => {
                codeBlockLookup.push(match);
                return 'EXCS_CODE_BLOCK_' + (codeBlockLookup.length - 1) + '_';
            });
        });
        return __html;
    };
    const decodeCodeBlocks = _html => {
        let index;
        let re;
        let __html = _html;

        for (index = 0; index < codeBlockLookup.length; index++) {
            re = new RegExp('EXCS_CODE_BLOCK_' + index + '_(="")?', 'gi');
            __html = replaceCodeBlock(__html, re, codeBlockLookup[index]);
        }
        return __html;
    };
    const encodeEntities = _html => encodeCodeBlocks(_html);
    const decodeEntities = _html => decodeCodeBlocks(_html);

    const dom = new JSDOM(encodeEntities(html));

    results.hrefs = [];

    const linkTags = dom.window.document.querySelectorAll('link');

    Array.prototype.forEach.call(linkTags, element => {
        if (element.getAttribute('rel') && element.getAttribute('rel').toLowerCase() === 'stylesheet') {
            if (options.applyLinkTags) {
                results.hrefs.push(element.getAttribute('href'));
            }
            if (options.removeLinkTags) {
                if (element.parentNode !== null) {
                    element.parentNode.removeChild(element);
                }
            }
        }
    });

    results.html = decodeEntities(decodeHTMLEntities(dom.serialize()));

    return results;
};
