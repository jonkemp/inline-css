const tableStyleAttrMap = {
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
};

const attributesToRemovePxFrom = [ 'height', 'width' ];

const applyStylesAsProps = (el, styleToAttrMap) => {
    let style;
    let styleVal;
    let attributeValue;

    for (style in styleToAttrMap) {
        styleVal = el.style[style];

        if (styleVal !== undefined) {
            if (attributesToRemovePxFrom.includes(style)) {
                attributeValue = styleVal.replace(/px$/i, '');
            } else {
                attributeValue = styleVal;
            }

            if (attributeValue.length > 0) {
                el.setAttribute(styleToAttrMap[style], attributeValue);
            } else {
                el.removeAttribute(styleToAttrMap[style]);
            }
            el.style[style] = '';
        }
    }
};

const batchApplyStylesAsProps = ($el, sel) => {
    const elements = $el.querySelectorAll(sel);

    Array.prototype.forEach.call(elements, el => {
        applyStylesAsProps(el, tableStyleAttrMap[sel]);
    });
};

const resetAttribute = (el, attribute) => {
    if (!el.getAttribute(attribute)) {
        el.setAttribute(attribute, 0);
    }
    return el;
};

module.exports = (el) => {
    let selector;
    let $el = el;

    $el = resetAttribute($el, 'border');
    $el = resetAttribute($el, 'cellpadding');
    $el = resetAttribute($el, 'cellspacing');

    for (selector in tableStyleAttrMap) {
        if (selector === 'table') {
            applyStylesAsProps($el, tableStyleAttrMap.table);
        } else {
            batchApplyStylesAsProps($el, selector);
        }
    }
};
