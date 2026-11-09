const parseCSS = require('css-rules');
const cheerio = require('cheerio');
const selectorParser = require('postcss-selector-parser');
const handleRule = require('./handleRule');
const setStyleAttrs = require('./setStyleAttrs');
const setWidthAttrs = require('./setWidthAttrs');
const setTableAttrs = require('./setTableAttrs');
const { protect } = require('inline-css-template-blocks');
const { error } = require('resource-policy');

module.exports = (html, css, opts = {}) => {
    const protectedHtml = protect(html, opts.codeBlocks);
    const protectedCss = protect(css, opts.codeBlocks);
    const $ = cheerio.load(protectedHtml.html, opts);
    const edited = new Set();

    if (opts.removeHtmlSelectors && ($('style').toArray().some(el => ($(el).html() || '').trim()) || $('link').toArray().some(el => ($(el).attr('rel') || '').toLowerCase().split(/\s+/).includes('stylesheet')))) {
        throw error('SELECTOR_RETENTION_CONFLICT', 'Cannot strip selectors while CSS is retained');
    }
    parseCSS(protectedCss.html).forEach((rule, sourceOrder) => {
        let dynamic = false;

        selectorParser(selectors => selectors.walkPseudos(pseudo => {
            if ([ ':hover', ':active', ':focus', ':focus-within', ':focus-visible', ':visited', ':link', ':before', ':after', '::before', '::after' ].includes(pseudo.value.toLowerCase())) {
                dynamic = true;
            }
        })).processSync(rule.selector);
        if (dynamic) {
            return;
        }
        let selected;

        try {
            selected = $(rule.selector);
        } catch (cause) {
            if (/Unknown pseudo-class|Pseudo-elements are not supported|not yet supported|Unmatched selector|Expected|Empty sub-selector|Malformed attribute selector|Missing closing|n-th rule couldn't be parsed|Unexpected type of selector/i.test(cause.message)) {
                return;
            }
            throw cause;
        }

        // Internal errors and inline-CSS parse errors must propagate, not masquerade as selectors.
        handleRule(rule, $, sourceOrder, selected).forEach(el => edited.add(el));
    });
    edited.forEach(el => {
        setStyleAttrs(el, $);
        if (opts.applyWidthAttributes) {
            setWidthAttrs(el, $);
        }
        if (opts.removeHtmlSelectors) {
            $(el).removeAttr('class').removeAttr('id');
        }
    });
    if (opts.applyTableAttributes) {
        $('table').each((index, el) => setTableAttrs(el, $));
    }
    return protectedCss.restore(protectedHtml.restore($.html()));
};
