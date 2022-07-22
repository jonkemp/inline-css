const parser = require('slick').parse;

/**
* Parses a selector and returns the tokens.
*
* @param {String} selector
* @api private.
*/

function parse(text) {
    try {
        return parser(text)[0];
    } catch (e) {
        return [];
    }
}

module.exports = rule => {
    let i;
    let j;
    let subSelPseudos;
    const ignoredPseudos = [ 'hover', 'active', 'focus', 'visited', 'link' ];

    // skip rule if the selector has any pseudos which are ignored
    const parsedSelector = parse(rule[0]);

    for (i = 0; i < parsedSelector.length; ++i) {
        subSelPseudos = parsedSelector[i].pseudos;

        if (subSelPseudos) {
            for (j = 0; j < subSelPseudos.length; ++j) {
                if (ignoredPseudos.indexOf(subSelPseudos[j].name) >= 0) {
                    return true;
                }
            }
        } else {
            return false;
        }
    }
    return undefined;
};
