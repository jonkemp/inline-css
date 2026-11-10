const cssSelector = require('./styleSelector');
const parseCSS = require('css-rules');
const addProps = require('./addProps');

module.exports = (rule, $, sourceOrder, selected) => {
    const specificity = cssSelector(rule.selector).specificity();
    const editedElements = [];

    selected.each((index, el) => {
        if (!el.styleDeclarations) {
            el.styleDeclarations = [];
            const inline = $(el).attr('style');

            if (inline) {
                addProps(el, parseCSS(`*{${inline}}`)[0].declarations, [ 1, 0, 0, 0 ], -1);
            }
            editedElements.push(el);
        }
        addProps(el, rule.declarations, specificity, sourceOrder);
    });
    return editedElements;
};
