'use strict';

var cssom = require('cssom'),
    os = require('os');

/**
 * Returns Media Query text for a CSS source.
 *
 * @param {String} css source
 * @api public
 */

module.exports = function (css) {
    var rules = cssom.parse(css).cssRules || [],
        queries = [],
        i,
        l = rules.length,
        query,
        queryString,
        ii,
        ll,
        rule,
        style,
        property,
        value,
        important,
        result;

    for (i = 0; i < l; i++) {
        /* CSS types
		  STYLE: 1,
		  IMPORT: 3,
		  MEDIA: 4,
		  FONT_FACE: 5,
		 */

        if (rules[i].type === cssom.CSSMediaRule.prototype.type) {
            query = rules[i];
            queryString = [];

            queryString.push(os.EOL + '@media ' + query.media[0] + ' {');

            ll = query.cssRules.length;

            for (ii = 0; ii < ll; ii++) {
                rule = query.cssRules[ii];

                if (rule.type === cssom.CSSStyleRule.prototype.type || rule.type === cssom.CSSFontFaceRule.prototype.type) {
                    queryString.push('  ' + (rule.type === cssom.CSSStyleRule.prototype.type ? rule.selectorText : '@font-face') + ' {');

                    for (style = 0; style < rule.style.length; style++) {
                        property = rule.style[style];
                        value = rule.style[property];
                        important = rule.style._importants[property] ? ' !important' : '';
                        queryString.push('    ' + property + ': ' + value + important + ';');
                    }
                    queryString.push('  }');
                }
            }

            queryString.push('}');
            result = queryString.length ? queryString.join(os.EOL) + os.EOL : '';

            queries.push(result);
        }
    }

    return queries.join(os.EOL);
};
