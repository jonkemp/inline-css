'use strict';

var cheerio = require('cheerio'),
    styleAttrMap = {},
    applyStylesAsProps = function ($el, styleToAttrMap) {
        var style,
            styleVal;

        for (style in styleToAttrMap) {
            styleVal = $el.css(style);

            if (styleVal !== undefined) {
                $el.attr(styleToAttrMap[style], styleVal);
                $el.css(style, '');
            }
        }
    },
    batchApplyStylesAsProps = function ($el, sel, $) {
        $el.find(sel).each(function (i, childEl) {
            applyStylesAsProps($(childEl), styleAttrMap[sel]);
        });
    };

cheerio.prototype.resetAttr = function (attribute) {
    if (!this.attr(attribute)) {
        this.attr(attribute, 0);
    }
    return this;
};

module.exports = function (styleAttributesMap, el, $) {
    var selector,
        $el = $(el);
    styleAttrMap = styleAttributesMap || {};

    $el = $el.resetAttr('border')
        .resetAttr('cellpadding')
        .resetAttr('cellspacing');

    for (selector in styleAttrMap) {
        if (selector === 'table') {
            applyStylesAsProps($el, styleAttrMap.table);
        } else {
            batchApplyStylesAsProps($el, selector, $);
        }
    }
};
