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

const applyStylesAsProps = ($el, styleToAttrMap) => {
    let style, styleVal, attributeValue;

    for (style in styleToAttrMap) {
        styleVal = $el.css(style);

        if (styleVal !== undefined) {
            if (attributesToRemovePxFrom.indexOf(style) > -1) {
                attributeValue = styleVal.replace(/px$/i, '');
            } else {
                attributeValue = styleVal;
            }

            $el.attr(styleToAttrMap[style], attributeValue);
            $el.css(style, '');
        }
    }
};

const batchApplyStylesAsProps = ($el, sel, $) => {
    $el.find(sel).each((i, childEl) => {
        applyStylesAsProps($(childEl), tableStyleAttrMap[sel]);
    });
};

function resetAttr(node, attribute) {
    if (node.attr(attribute)) {
        return;
    }
    node.attr(attribute, 0);
}

module.exports = (el, $) => {
    let selector;
    let $el = $(el);

    resetAttr($el, 'border');
    resetAttr($el, 'cellpadding');
    resetAttr($el, 'cellspacing');

    for (selector in tableStyleAttrMap) {
        if (selector === 'table') {
            applyStylesAsProps($el, tableStyleAttrMap.table);
        } else {
            batchApplyStylesAsProps($el, selector, $);
        }
    }
};
