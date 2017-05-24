'use strict';

var centerElements = [ 'img' ];
var centerContainers = [ 'table' ];

module.exports = function (el, $) {
    var i,
        wrapper;

    if (centerElements.indexOf(el.name) > -1) {
        for (i in el.styleProps) {
            if (el.styleProps[i].prop === 'margin' && el.styleProps[i].value.match(/auto/)) {
                // create wrapper container
                wrapper = $('<center>' + $(el).toString() + '</center>');

                $(el).replaceWith(wrapper);

                return;
            }
        }
    }

    if (centerContainers.indexOf(el.name) > -1) {
        for (i in el.styleProps) {
            if (el.styleProps[i].prop === 'margin' && el.styleProps[i].value.match(/auto/)) {
                $(el).attr('align', 'center');

                return;
            }
        }
    }
};
