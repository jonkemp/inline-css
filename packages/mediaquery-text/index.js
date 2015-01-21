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
    var rules = cssom.parse(css).cssRules || [];
    var queries = [];

    for (var i = 0, l = rules.length; i < l; i++) {
        /* CSS types
		  STYLE: 1,
		  IMPORT: 3,
		  MEDIA: 4,
		  FONT_FACE: 5,
		 */

        if (rules[i].type === cssom.CSSMediaRule.prototype.type) {
            var query = rules[i];
            var queryString = [];

            queryString.push(os.EOL + '@media ' + query.media[0] + ' {');

            for (var ii = 0, ll = query.cssRules.length; ii < ll; ii++) {
                var rule = query.cssRules[ii];

                if (rule.type === cssom.CSSStyleRule.prototype.type || rule.type === cssom.CSSFontFaceRule.prototype.type) {
                    queryString.push('  ' + (rule.type === cssom.CSSStyleRule.prototype.type ? rule.selectorText : '@font-face') + ' {');

                    for (var style = 0; style < rule.style.length; style++) {
                        var property = rule.style[style];
                        var value = rule.style[property];
                        var important = rule.style._importants[property] ? ' !important' : '';
                        queryString.push('    ' + property + ': ' + value + important + ';');
                    }
                    queryString.push('  }');
                }
            }

            queryString.push('}');
            var result = queryString.length ? queryString.join(os.EOL) + os.EOL : '';

            queries.push(result);
        }
    }

    return queries.join(os.EOL);
};
