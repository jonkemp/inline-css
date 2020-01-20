module.exports = (el, $) => {
    let i;
    let style = [];

    for (i in el.styleProps) {

        // add !important
        if (typeof el.styleProps[i].selector.spec !== 'undefined') {
            if (el.styleProps[i].selector.spec[0] === 2) {
                el.styleProps[i].value += ' !important';
            }
        }
        style.push(`${el.styleProps[i].prop}: ${el.styleProps[i].value.replace(/["]/g, '\'')};`);
    }

    // sorting will arrange styles like padding: before padding-bottom: which will preserve the expected styling
    style = style.sort((a, b) => {
        const aProp = a.split(':')[0];
        const bProp = b.split(':')[0];

        return (aProp > bProp ? 1 : aProp < bProp ? -1 : 0);
    });

    $(el).attr('style', style.join(' '));
};
