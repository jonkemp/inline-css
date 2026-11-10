module.exports = (a, b) => {
    if (a.important !== b.important) {
        return Number(a.important) - Number(b.important);
    }
    for (let index = 0; index < 4; index++) {
        if (a.specificity[index] !== b.specificity[index]) {
            return a.specificity[index] - b.specificity[index];
        }
    }
    return a.sourceOrder - b.sourceOrder || a.declarationOrder - b.declarationOrder;
};
