'use strict';

var centerElements = [ 'table', 'td', 'img' ];

module.exports = function (el, $) {
    var i;

    if (centerElements.indexOf(el.name) > -1) {
        for (i in el.styleProps) {
            if (el.styleProps[i].prop === 'margin' && el.styleProps[i].value.match(/auto/)) {
                $(el).attr('align', 'center');
                return;
            }
        }
    }
};
