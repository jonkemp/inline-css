'use strict';

var cssom = require('cssom'),
    os = require('os'),
    CSSFontFaceRule = require('cssom/lib/CSSFontFaceRule').CSSFontFaceRule;

/**
 * Returns Media Query text for a CSS source.
 *
 * @param {String} css source
 * @api public
 */

module.exports = function (css) {
    var rules = cssom.parse(css).cssRules || [],
        queries = [],
        queryString,
        style,
        property,
        value,
        important,
        result;

    rules.forEach(function (query) {
        /* CSS types
		  STYLE: 1,
		  IMPORT: 3,
		  MEDIA: 4,
		  FONT_FACE: 5,
		 */

        if (query.type === cssom.CSSMediaRule.prototype.type) {
            queryString = [];

            queryString.push(os.EOL + '@media ' + query.media[0] + ' {');

            query.cssRules.forEach(function (rule) {
                if (rule.type === cssom.CSSStyleRule.prototype.type || rule.type === CSSFontFaceRule.prototype.type) {
                    queryString.push('  ' + (rule.type === cssom.CSSStyleRule.prototype.type ? rule.selectorText : '@font-face') + ' {');

                    for (style = 0; style < rule.style.length; style++) {
                        property = rule.style[style];
                        value = rule.style[property];
                        important = rule.style._importants[property] ? ' !important' : '';
                        queryString.push('    ' + property + ': ' + value + important + ';');
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
