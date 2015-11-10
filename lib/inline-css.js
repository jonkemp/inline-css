'use strict';

var parseCSS = require('css-rules'),
    cheerio = require('cheerio'),
    Selector = require('style-selector'),
    Property = require('css-property'),
    styleSelector = new Selector('<style attribute>', [1, 0, 0, 0]),
    importantSelector = new Selector('<!important>', [2, 0, 0, 0]),
    ignoredPseudos = ['hover', 'active', 'focus', 'visited', 'link'],
    widthElements = ['table', 'td', 'img'];

var tableStyleAttrMap = {
    'table': {
        'float': 'align',
        'background-color': 'bgcolor',
        'width': 'width',
        'height': 'height'
    },
    'tr': {
        'background-color': 'bgcolor',
        'vertical-align': 'valign',
        'text-align': 'align'
    },
    'td,th': {
        'background-color': 'bgcolor',
        'width': 'width',
        'height': 'height',
        'vertical-align': 'valign',
        'text-align': 'align',
        'white-space': 'nowrap'
    },
    'tbody,thead,tfoot': {
        'vertical-align': 'valign',
        'text-align': 'align'
    }
};

module.exports = function (html, css, options) {
    var rules = parseCSS(css),
        editedElements = [],
        $ = cheerio.load(html, {
            decodeEntities: false
        });

    function handleRule(rule) {
        var sel = rule[0],
        style = rule[1],
        selector = new Selector(sel);

        // skip rule if the selector has any pseudos which are ignored
        var parsedSelector = selector.parsed();

        for (var i = 0; i < parsedSelector.length; ++i) {
            var subSel = parsedSelector[i];

            if (subSel.pseudos) {
                for (var j = 0; j < subSel.pseudos.length; ++j) {
                    var subSelPseudo = subSel.pseudos[j];

                    if (ignoredPseudos.indexOf(subSelPseudo.name) >= 0) {
                        return;
                    }
                }
            }
        }

        var $els;

        try {
            $els = $(sel);
        } catch (err) {
            // skip invalid selector
            return;
        }
        $els.each(function (index, el) {
            // go through the properties
            function addProps(style, selector) {
                for (var i = 0, l = style.length; i < l; i++) {
                    var name = style[i],
                        value = style[name],
                        sel = style._importants[name] ? importantSelector : selector,
                        prop = new Property(name, value, sel),
                        existing = el.styleProps[name],
                        winner,
                        loser;

                    if (existing) {
                        winner = existing.compare(prop);
                        loser = prop === winner ? existing : prop;

                        if (winner === prop) {
                            el.styleProps[name] = prop;
                        }
                    } else {
                        el.styleProps[name] = prop;
                    }
                }
            }

            if (!el.styleProps) {
                el.styleProps = {};

                // if the element has inline styles, fake selector with topmost specificity
                if ($(el).attr('style')) {
                    var cssText = '* { ' + $(el).attr('style') + ' } ';

                    addProps(parseCSS(cssText)[0][1], styleSelector);
                }

                // store reference to an element we need to compile style="" attr for
                editedElements.push(el);
            }

            addProps(style, selector);
        });
    }

    function setStyleAttrs(el) {
        var style = [];

        for (var i in el.styleProps) {

          // add !important
            if (typeof el.styleProps[i].selector.spec !== 'undefined') {
                if (el.styleProps[i].selector.spec[0] === 2) {
                    el.styleProps[i].value = el.styleProps[i].value + ' !important';
                }
            }
            style.push(el.styleProps[i].prop + ': ' + el.styleProps[i].value.replace(/["]/g, '\'') + ';');
        }

        // sorting will arrange styles like padding: before padding-bottom: which will preserve the expected styling
        style = style.sort(function (a, b) {
            var aProp = a.split(':')[0];
            var bProp = b.split(':')[0];

            return (aProp > bProp ? 1 : aProp < bProp ? -1 : 0);
        });
        $(el).attr('style', style.join(' '));
    }

    function setWidthAttrs(el) {
        if (widthElements.indexOf(el.name) > -1) {
            for (var i in el.styleProps) {
                if (el.styleProps[i].prop === 'width' && el.styleProps[i].value.match(/px/)) {
                    var pxWidth = el.styleProps[i].value.replace('px', '');

                    $(el).attr('width', pxWidth);
                    return;
                }
            }
        }
    }

    function removeHtmlSelectors(el) {
        var selectors = ['class', 'id'];

        selectors.forEach(function (selector) {
            var attribute = $(el).attr(selector);

            if (typeof attribute !== 'undefined') {
                $(el).removeAttr(selector);
            }
        });
    }

    function applyStylesAsProps($el, styleToAttrMap) {
        for (var style in styleToAttrMap) {
            var styleVal = $el.css(style);
            if (styleVal != undefined) {
                $el.attr(styleToAttrMap[style], styleVal);
                $el.css(style, '');
            }
        }
    }

    function setTableAttrs(index, el) {
        var $el = $(el);

        if (!$el.attr('border')) {
            $el.attr('border', 0);
        }
        if (!$el.attr('cellpadding')) {
            $el.attr('cellpadding', 0);
        }
        if (!$el.attr('cellspacing')) {
            $el.attr('cellspacing', 0);
        }



        for (var selector in tableStyleAttrMap){
            if (selector == 'table'){
                applyStylesAsProps($el, tableStyleAttrMap['table']);
            } else {
                $el.find(selector).each(function(i, childEl){
                    applyStylesAsProps($(childEl), tableStyleAttrMap[selector]);
                });
            }
        }
    }

    rules.forEach(handleRule);
    editedElements.forEach(setStyleAttrs);

    if (options) {
        if (options.applyWidthAttributes) {
            editedElements.forEach(setWidthAttrs);
        }
        if (options.applyTableAttributes) {
            $('table').each(setTableAttrs);
        }
    }

    if (options && options.removeHtmlSelectors) {
        editedElements.forEach(removeHtmlSelectors);
    }

    return $.html();
};
