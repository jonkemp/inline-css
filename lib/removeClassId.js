module.exports = (el) => {
    const selectors = [ 'class', 'id' ];

    selectors.forEach(selector => {
        const attribute = el.getAttribute(selector);

        if (typeof attribute !== 'undefined') {
            el.removeAttribute(selector);
        }
    });
};
