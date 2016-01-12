'use strict';

var Selector = require('style-selector'),
    parseCSS = require('css-rules'),
    styleSelector = new Selector('<style attribute>', [ 1, 0, 0, 0 ]),
    addProps = require('./addProps');

module.exports = function (rule, $) {
    var sel = rule[0],
        style = rule[1],
        selector = new Selector(sel),
        editedElements = [];

    $(sel).each(function (index, el) {
        var cssText;

        if (!el.styleProps) {
            el.styleProps = {};

            // if the element has inline styles, fake selector with topmost specificity
            if ($(el).attr('style')) {
                cssText = '* { ' + $(el).attr('style') + ' } ';

                addProps(el, parseCSS(cssText)[0][1], styleSelector);
            }

            // store reference to an element we need to compile style="" attr for
            editedElements.push(el);
        }

        addProps(el, style, selector);
    });

    return editedElements;
};
