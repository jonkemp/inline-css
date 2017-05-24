'use strict';

var heightElements = [ 'table', 'td', 'img' ];

module.exports = function (el, $) {
    var i,
        pxHeight;

    if (heightElements.indexOf(el.name) > -1) {
        for (i in el.styleProps) {
            if (el.styleProps[i].prop === 'height' && el.styleProps[i].value.match(/px/)) {
                pxHeight = el.styleProps[i].value.replace('px', '');

                $(el).attr('height', pxHeight);
                return;
            }
        }
    }
};
