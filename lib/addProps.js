'use strict';

var cssSelector = require('./styleSelector'),
    importantSelector = cssSelector('<!important>', [ 2, 0, 0, 0 ]),
    property = require('./cssProperty');

function getProperty(style, name, selector) {
    var value = style[name],
        sel = style._importants[name] ? importantSelector : selector;

    return property(name, value, sel);
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
