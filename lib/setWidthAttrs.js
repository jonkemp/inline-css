const widthElements = [ 'table', 'td', 'img' ];

module.exports = (el) => {
    let i;
    let pxWidth;

    if (widthElements.includes(el.tagName.toLowerCase())) {
        for (i in el.styleProps) {
            if (el.styleProps[i].prop === 'width' && el.styleProps[i].value.match(/px/)) {
                pxWidth = el.styleProps[i].value.replace('px', '');

                el.setAttribute('width', pxWidth);
                return;
            }
        }
    }
};
