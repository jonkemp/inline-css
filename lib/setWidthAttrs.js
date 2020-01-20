const widthElements = [ 'table', 'td', 'img' ];

module.exports = (el, $) => {
    let i;
    let pxWidth;

    if (widthElements.indexOf(el.name) > -1) {
        for (i in el.styleProps) {
            if (el.styleProps[i].prop === 'width' && el.styleProps[i].value.match(/px/)) {
                pxWidth = el.styleProps[i].value.replace('px', '');

                $(el).attr('width', pxWidth);
                return;
            }
        }
    }
};
