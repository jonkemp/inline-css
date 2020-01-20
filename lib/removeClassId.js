module.exports = (el, $) => {
    const selectors = [ 'class', 'id' ];

    selectors.forEach(selector => {
        const attribute = $(el).attr(selector);

        if (typeof attribute !== 'undefined') {
            $(el).removeAttr(selector);
        }
    });
};
