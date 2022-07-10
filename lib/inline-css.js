const parseCSS = require('css-rules');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const pseudoCheck = require('./pseudoCheck');
const handleRule = require('./handleRule');
const flatten = require('flat-util');
const setStyleAttrs = require('./setStyleAttrs');
const setWidthAttrs = require('./setWidthAttrs');
const removeClassId = require('./removeClassId');
const setTableAttrs = require('./setTableAttrs');

function replaceCodeBlock(html, re, block) {
    return html.replace(re, () => block);
}

function decodeHTMLEntities(str) {
    return String(str).replace(/&amp;/g, '&');
}

module.exports = (html, css, options) => {
    const opts = options || {};
    let rules;
    let editedElements = [];
    const codeBlockLookup = [];

    const encodeCodeBlocks = _html => {
        let __html = _html;
        const blocks = opts.codeBlocks;

        Object.keys(blocks).forEach(key => {
            const re = new RegExp(`${blocks[key].start}([\\S\\s]*?)${blocks[key].end}`, 'g');

            __html = __html.replace(re, match => {
                codeBlockLookup.push(match);
                return `EXCS_CODE_BLOCK_${codeBlockLookup.length - 1}_`;
            });
        });
        return __html;
    };

    const decodeCodeBlocks = _html => {
        let index;
        let re;
        let __html = _html;

        for (index = 0; index < codeBlockLookup.length; index++) {
            re = new RegExp(`EXCS_CODE_BLOCK_${index}_(="")?`, 'gi');
            __html = replaceCodeBlock(__html, re, codeBlockLookup[index]);
        }
        return __html;
    };

    const encodeEntities = _html => encodeCodeBlocks(_html);
    const decodeEntities = _html => decodeCodeBlocks(_html);

    const dom = new JSDOM(encodeEntities(html), {
        contentType: opts.xmlMode ? 'application/xhtml+xml' : 'text/html'
    });

    try {
        rules = parseCSS(css);
    } catch (err) {
        throw new Error(err);
    }

    rules.forEach(rule => {
        let el;
        let ignoredPseudos;

        ignoredPseudos = pseudoCheck(rule);

        if (ignoredPseudos) {
            return false;
        }

        try {
            el = handleRule(rule, dom);

            editedElements.push(el);
        } catch (err) {
            // skip invalid selector
            return false;
        }
    });

    // flatten array if nested
    editedElements = flatten(editedElements);

    editedElements.forEach(el => {
        setStyleAttrs(el, dom);

        if (opts.applyWidthAttributes) {
            setWidthAttrs(el);
        }

        if (opts.removeHtmlSelectors) {
            removeClassId(el);
        }
    });

    if (opts.applyTableAttributes) {
        const tables = dom.window.document.querySelectorAll('table');

        Array.prototype.forEach.call(tables, el => {
            setTableAttrs(el, dom);
        });
    }

    return decodeEntities(decodeHTMLEntities(dom.serialize()));
};
