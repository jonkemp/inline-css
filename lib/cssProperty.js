'use strict';

/**
 * Compares two specificity vectors, returning the winning one.
 *
 * @param {Array} vector a
 * @param {Array} vector b
 * @return {Array}
 * @api public
 */

function compareSpecificity(a, b) {
    var i;

    for (i = 0; i < 4; i++) {
        if (a[i] === b[i]) {
            continue;
        }
        if (a[i] > b[i]) {
            return a;
        }
        return b;
    }

    return b;
}

/**
 * CSS property constructor.
 *
 * @param {String} property
 * @param {String} value
 * @param {Selector} selector the property originates from
 * @api public
 */

module.exports = function (prop, value, selector) {
    var o = {},

        /**
         * Compares with another Property based on Selector#specificity.
         *
         * @api public
         */

        compare = function (property) {
            var a = selector.specificity(),
                b = property.selector.specificity(),
                winner = compareSpecificity(a, b);

            if (winner === a && a !== b) {
                return o;
            }
            return property;
        };

    o = {
        prop: prop,
        value: value,
        selector: selector,
        compare: compare
    };

    return o;
};
