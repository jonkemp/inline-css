const compare = require('./cssProperty');

module.exports = (el, $) => {
    el.styleDeclarations.sort(compare);

    // Retain repeated declarations: fallback values and shorthand resets depend on order.
    const style = el.styleDeclarations.map(decl => `${decl.property}: ${decl.value}${decl.important ? ' !important' : ''};`).join(' ');

    $(el).attr('style', style);
};
