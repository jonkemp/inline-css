'use strict';

module.exports = function (el, $) {
    var selectors = [ 'class', 'id' ];

    selectors.forEach(function (selector) {
        var attribute = $(el).attr(selector);

        if (typeof attribute !== 'undefined') {
            $(el).removeAttr(selector);
        }
    });
};
