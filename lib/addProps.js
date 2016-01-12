'use strict';

var Selector = require('style-selector'),
    importantSelector = new Selector('<!important>', [ 2, 0, 0, 0 ]),
    Property = require('css-property');

function getProperty(style, name, selector) {
    var value = style[name],
        sel = style._importants[name] ? importantSelector : selector;

    return new Property(name, value, sel);
}

// go through the properties
module.exports = function (el, style, selector) {
    var i,
        l = style.length,
        name,
        prop,
        existing,
        winner;

    for (i = 0; i < l; i++) {
        name = style[i];
        prop = getProperty(style, name, selector);
        existing = el.styleProps[name];

        if (existing) {
            winner = existing.compare(prop);

            if (winner === prop) {
                el.styleProps[name] = prop;
            }
        } else {
            el.styleProps[name] = prop;
        }
    }
};
