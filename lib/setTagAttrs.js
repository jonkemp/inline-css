'use strict';

var $,
    attribute,
    styleAttributesMap,
    styleVal,
    applyStylesAsProps = function ($el, style, attributeVal) {
        styleVal = $el.css(style);
        if (styleVal !== undefined && attributeVal !== null) {
            if (/^([\'|\"][a-z\-\s]+[\'|\"])$/i.test(styleVal) === true) {
                styleVal = styleVal.substring(1, (styleVal.length - 1));
            }
            $el.attr(attributeVal, styleVal);
            $el.css(style, '');
        }
    },
    getStyleValue = function (isArray, prop) {
        return isArray === true ? styleAttributesMap[prop] : prop;
    },
    loopThroughMap = function (index, el) {
        var prop,
            mapIsArray = Array.isArray(styleAttributesMap),
            $el = $(el);

        for (prop in styleAttributesMap) {
            applyStylesAsProps($el, getStyleValue(mapIsArray, prop), styleAttributesMap[prop]);
        }
    };

module.exports = function exports(cheerio, applyAttributesTo) {
    $ = cheerio;
    for (attribute in applyAttributesTo) {
        styleAttributesMap = applyAttributesTo[attribute];
        $(attribute).each(loopThroughMap);
    }
};
