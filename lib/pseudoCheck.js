'use strict';

var Selector = require('style-selector');

function parseSelector(rule) {
    var sel = rule[0],
        selector = new Selector(sel);

    return selector.parsed();
}

module.exports = function (rule) {
    var i,
        j,
        subSelPseudos,
        ignoredPseudos = [ 'hover', 'active', 'focus', 'visited', 'link' ],

        // skip rule if the selector has any pseudos which are ignored
        parsedSelector = parseSelector(rule);

    for (i = 0; i < parsedSelector.length; ++i) {
        subSelPseudos = parsedSelector[i].pseudos;

        if (subSelPseudos) {
            for (j = 0; j < subSelPseudos.length; ++j) {
                if (ignoredPseudos.indexOf(subSelPseudos[j].name) >= 0) {
                    return false;
                }
            }
        }
    }
};
