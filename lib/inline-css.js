'use strict';

var parseCSS = require('css-rules'),
    cheerio = require('cheerio'),
    Selector = require('style-selector'),
    Property = require('css-property'),
    styleSelector = new Selector('<style attribute>', [1, 0, 0, 0]),
    importantSelector = new Selector('<!important>', [2, 0, 0, 0]),
    ignoredPseudos = ['hover', 'active', 'focus', 'visited', 'link'],
    widthElements = ['TABLE', 'TD', 'IMG'];

function setStyleAttrs(el) {
    var style = [];
    for (var i in el.styleProps) {
        style.push(el.styleProps[i].prop + ': ' + el.styleProps[i].value.replace(/["]/g, '\'') + ';');
    }
    // sorting will arrange styles like padding: before padding-bottom: which will preserve the expected styling
    style = style.sort(function (a, b) {
        var aProp = a.split(':')[0];
        var bProp = b.split(':')[0];
        return (aProp > bProp ? 1 : aProp < bProp ? -1 : 0);
    });
    //el.setAttribute('style', style.join(' '));
}

function setWidthAttrs(el) {
    if (widthElements.indexOf(el.nodeName) > -1) {
        for (var i in el.styleProps) {
            if (el.styleProps[i].prop === 'width' && el.styleProps[i].value.match(/px/)) {
                var pxWidth = el.styleProps[i].value.replace('px', '');
                el.setAttribute('width', pxWidth);
                return;
            }
        }
    }
}

module.exports = function (html, css, options) {

    var rules = parseCSS(css),
        editedElements = [],
        $ = cheerio.load(html);

    rules.forEach(handleRule);
    editedElements.forEach(setStyleAttrs);

    if (options && options.applyWidthAttributes) {
        editedElements.forEach(setWidthAttrs);
    }

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
            if (!el.styleProps) {
                el.styleProps = {};

                // if the element has inline styles, fake selector with topmost specificity
                if ($(el).attr('style')) {
                    var cssText = '* { ' + el.getAttribute('style') + ' } ';
                    addProps(parseCSS(cssText)[0][1], styleSelector);
                }

                // store reference to an element we need to compile style="" attr for
                editedElements.push(el);
            }

            // go through the properties
            function addProps(style, selector) {
                for (var i = 0, l = style.length; i < l; i++) {
                    var name = style[i],
                        value = style[name],
                        sel = style._importants[name] ? importantSelector : selector,
                        prop = new Property(name, value, sel);

                    if ($(el).attr('style')) {
                        var currentStyle = $(el).attr('style');
                        $(el).attr('style', currentStyle + ' ' + prop);
                    } else {
                        el.styleProps[name] = prop;
                        $(el).attr('style', prop);
                    }
                }
            }

            addProps(style, selector);
        });
    }

    return $.html();
};
