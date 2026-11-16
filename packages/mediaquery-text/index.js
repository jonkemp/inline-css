const cssom = require('cssom');
const os = require('os');
const CSSFontFaceRule = require('cssom/lib/CSSFontFaceRule').CSSFontFaceRule;

const supportedRule = rule => rule.type === cssom.CSSStyleRule.prototype.type || rule.type === CSSFontFaceRule.prototype.type;
const renderRule = rule => {
    const lines = [ `  ${rule.type === cssom.CSSStyleRule.prototype.type ? rule.selectorText : '@font-face'} {` ];

    for (let index = 0; index < rule.style.length; index++) {
        const property = rule.style[index];
        const important = rule.style._importants[property] ? ' !important' : '';

        lines.push(`    ${property}: ${rule.style[property]}${important};`);
    }
    lines.push('  }');
    return lines.join(os.EOL);
};
const renderMedia = ({ media, cssRules }) => {
    const queryMedia = Array.prototype.slice.call(media).join(', ');
    const lines = [ `${os.EOL}@media ${queryMedia} {`, ...cssRules.filter(supportedRule).map(renderRule), '}' ];

    return lines.join(os.EOL) + os.EOL;
};

/** Returns Media Query text for a CSS source. */
module.exports = css => (cssom.parse(css).cssRules || [])
    .filter(rule => rule.type === cssom.CSSMediaRule.prototype.type)
    .map(renderMedia).join(os.EOL);
