'use strict';

var $,
    element,
    isTable = false,
    tableElementMap = {
        table: {
            float: 'align',
            'background-color': 'bgcolor',
            width: 'width',
            height: 'height'
        },
        tr: {
            'background-color': 'bgcolor',
            'vertical-align': 'valign',
            'text-align': 'align'
        },
        'td,th': {
            'background-color': 'bgcolor',
            width: 'width',
            height: 'height',
            'vertical-align': 'valign',
            'text-align': 'align',
            'white-space': 'nowrap'
        },
        'tbody,thead,tfoot': {
            'vertical-align': 'valign',
            'text-align': 'align'
        }
    },
    styleAttributesMap,
    styleVal,
    applyStylesAsProps = function ($el, style, attribute) {
        styleVal = $el.css(style);
        if (styleVal !== undefined && attribute !== null) {
            if (/^([\'|\"][a-z\-\s]+[\'|\"])$/i.test(styleVal) === true) {
                styleVal = styleVal.substring(1, (styleVal.length - 1));
            }
            $el.attr(attribute, styleVal);
            $el.css(style, '');
        }
    },
    getStyleValue = function (isArray, prop) {
        return isArray === true ? styleAttributesMap[prop] : prop;
    },
    resetAttr = function ($el, attribute) {
        if (!$el.attr(attribute)) {
            $el.attr(attribute, 0);
        }
    },
    loopThroughMap = function (index, el) {
        var prop,
            mapIsArray = Array.isArray(styleAttributesMap),
            $el = $(el);

        if (isTable === true && $el[0].name === 'table') { // we're attempting to be backwards compatible with setTableAttrs
            resetAttr($el, 'border');
            resetAttr($el, 'cellpadding');
            resetAttr($el, 'cellspacing');
        }
        for (prop in styleAttributesMap) {
            applyStylesAsProps($el, getStyleValue(mapIsArray, prop), styleAttributesMap[prop]);
        }
    };

module.exports = function exports(cheerio, applyAttrTo, isTab) {
    var applyAttributesTo;

    $ = cheerio;
    isTable = isTab;
    if (isTab === true) {
        applyAttributesTo = Object.assign({}, tableElementMap);
    } else {
        applyAttributesTo = applyAttrTo;
    }
    for (element in applyAttributesTo) {
        styleAttributesMap = applyAttributesTo[element];
        $(element).each(loopThroughMap);
    }
};
