'use strict';

var cheerio = require('cheerio'),
    styleAttrMap = {},
    applyStylesAsProps = function ($el, style, attribute) {
        var style,
            styleVal;

        styleVal = $el.css(style);
        if (styleVal !== undefined) {
            $el.attr(attribute, styleVal);
            $el.css(style, '');
        }
    }

cheerio.prototype.resetAttr = function (attribute) {
    if (!this.attr(attribute)) {
        this.attr(attribute, 0);
    }
    return this;
};

module.exports = function (styleAttributesMap, el, $) {
    var style,
        $el = $(el);
    styleAttrMap = styleAttributesMap || {};

    for (style in styleAttrMap) {
      if( typeof styleAttrMap[style] === 'string' ){
        applyStylesAsProps($el, style, styleAttrMap[style]);
      }
    }
};
