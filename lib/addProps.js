module.exports = (el, declarations, specificity, sourceOrder) => {
    declarations.forEach(decl => el.styleDeclarations.push({ ...decl, specificity, sourceOrder, declarationOrder: decl.order }));
};
