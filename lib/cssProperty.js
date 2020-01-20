/**
 * Compares two specificity vectors, returning the winning one.
 *
 * @param {Array} vector a
 * @param {Array} vector b
 * @return {Array}
 * @api public
 */

function compareSpecificity(a, b) {
    let i;

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

module.exports = (prop, value, selector) => {
    let o = {};

    /**
     * Compares with another Property based on Selector#specificity.
     *
     * @api public
     */

    const compare = property => {
        const a = selector.specificity();
        const b = property.selector.specificity();
        const winner = compareSpecificity(a, b);

        if (winner === a && a !== b) {
            return o;
        }
        return property;
    };

    o = {
        prop,
        value,
        selector,
        compare
    };

    return o;
};
