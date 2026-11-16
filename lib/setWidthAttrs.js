module.exports = (el, $) => {
    if (![ 'table', 'td', 'img' ].includes(el.name)) {
        return;
    }
    const widths = el.styleDeclarations.filter(decl => decl.property.toLowerCase() === 'width');
    const effective = widths[widths.length - 1];

    if (effective && /^\d+(?:\.\d+)?px$/i.test(effective.value)) {
        $(el).attr('width', effective.value.slice(0, -2));
    }
};
