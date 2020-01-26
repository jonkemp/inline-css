const cssom = require('cssom');
const os = require('os');
const CSSFontFaceRule = require('cssom/lib/CSSFontFaceRule').CSSFontFaceRule;

/**
 * Returns Media Query text for a CSS source.
 *
 * @param {String} css source
 * @api public
 */

module.exports = css => {
    const rules = cssom.parse(css).cssRules || [];
    const queries = [];
    let queryMedia;
    let queryString;
    let style;
    let property;
    let value;
    let important;
    let result;

    rules.forEach(({ type, media, cssRules }) => {
        /* CSS types
		  STYLE: 1,
		  IMPORT: 3,
		  MEDIA: 4,
		  FONT_FACE: 5,
		 */

        if (type === cssom.CSSMediaRule.prototype.type) {
            queryMedia = Array.prototype.slice.call(media).join(', ');
            queryString = [];

            queryString.push(`${os.EOL}@media ${queryMedia} {`);

            cssRules.forEach(rule => {
                if (rule.type === cssom.CSSStyleRule.prototype.type || rule.type === CSSFontFaceRule.prototype.type) {
                    queryString.push(`  ${rule.type === cssom.CSSStyleRule.prototype.type ? rule.selectorText : '@font-face'} {`);

                    for (style = 0; style < rule.style.length; style++) {
                        property = rule.style[style];
                        value = rule.style[property];
                        important = rule.style._importants[property] ? ' !important' : '';
                        queryString.push(`    ${property}: ${value}${important};`);
                    }
                    queryString.push('  }');
                }
            });

            queryString.push('}');
            result = queryString.length ? queryString.join(os.EOL) + os.EOL : '';

            queries.push(result);
        }
    });

    return queries.join(os.EOL);
};
