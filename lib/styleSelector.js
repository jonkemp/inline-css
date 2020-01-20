/**
 * Module dependencies.
 */

const specificity = require('specificity');

/**
* Returns specificity based on selector text and tokens.
*
* @param {String} selector
* @param {Array} tokens
* @api private.
*/

function getSpecificity(text) {
    const spec = specificity.calculate(text);

    return spec[0].specificity.split(',');
}

/**
 * CSS selector constructor.
 *
 * @param {String} selector text
 * @param {Array} optionally, precalculated specificity
 * @api public
 */

module.exports = (text, spec) => {
    let _spec = spec;

    const /**
     * Lazy specificity getter
     *
     * @api public
     */

        _specificity = () => {
            if (!spec) {
                _spec = getSpecificity(text);
            }
            return _spec;
        };

    return {
        spec: _spec,

        specificity: _specificity
    };
};
