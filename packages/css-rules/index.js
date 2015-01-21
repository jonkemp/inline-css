'use strict';

var cssom = require('cssom');

/**
* Returns an array of the selectors.
*
* @license Sizzle CSS Selector Engine - MIT
* @param {String} selectorText from cssom
* @api public
*/

function extract(selectorText) {
    var attr = 0,
    sels = [],
    sel = '';

    for (var i = 0, l = selectorText.length; i < l; i++) {
        var c = selectorText.charAt(i);

        if (attr) {
            if (']' === c || ')' === c) {
                attr--;
            }
            sel += c;
        } else {
            if (',' === c) {
                sels.push(sel);
                sel = '';
            } else {
                if ('[' === c || '(' === c) {
                    attr++;
                }
                if (sel.length || (c !== ',' && c !== '\n' && c !== ' ')) {
                    sel += c;
                }
            }
        }
    }

    if (sel.length) {
        sels.push(sel);
    }

    return sels;
}

/**
 * Returns a parse tree for a CSS source.
 * If it encounters multiple selectors separated by a comma, it splits the
 * tree.
 *
 * @param {String} css source
 * @api public
 */

module.exports = function (css) {
    var rules = cssom.parse(css).cssRules || [],
        ret = [];

    for (var i = 0, l = rules.length; i < l; i++) {
        if (rules[i].selectorText) { // media queries don't have selectorText
            var rule = rules[i],
                selectors = extract(rule.selectorText);

            for (var ii = 0, ll = selectors.length; ii < ll; ii++) {
                ret.push([selectors[ii], rule.style]);
            }
        }
    }

    return ret;
};
