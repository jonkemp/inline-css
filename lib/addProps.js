module.exports = (el, declarations, rank) => {
    declarations.forEach(decl => el.styleDeclarations.push({ ...decl, ...rank, declarationOrder: decl.order }));
};
