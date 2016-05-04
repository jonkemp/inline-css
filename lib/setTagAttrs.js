'use strict';

var cheerio = require('cheerio'),
    styleAttrMap = {},
    applyStylesAsProps = function ($el, style, attribute) {
        var style,
            styleVal;

        styleVal = $el.css(style);
        if (styleVal !== undefined) {
            if (/^([\'|\"][a-z\-\s]+[\'|\"])$/i.test(styleVal) === true){
                styleVal = styleVal.substring(1, (styleVal.length - 1));
            }
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

    if (Array.isArray(styleAttrMap) !== true){
        for (style in styleAttrMap) {
          if (typeof styleAttrMap[style] === 'string'){
            applyStylesAsProps($el, style, styleAttrMap[style]);
          }
        }
    } else {
      for (var index in styleAttrMap) {
        style = styleAttrMap[index];
        if (typeof style === 'string'){
          applyStylesAsProps($el, style, style);
        }
      }
    }
};
