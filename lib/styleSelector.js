'use strict';

/**
 * Module dependencies.
 */

var specificity = require('specificity');

/**
* Returns specificity based on selector text and tokens.
*
* @param {String} selector
* @param {Array} tokens
* @api private.
*/

function getSpecificity(text) {
    var spec = specificity.calculate(text);

    return spec[0].specificity.split(',');
}

/**
 * CSS selector constructor.
 *
 * @param {String} selector text
 * @param {Array} optionally, precalculated specificity
 * @api public
 */

module.exports = function (text, spec) {
    var _spec = spec,

        /**
         * Lazy specificity getter
         *
         * @api public
         */

        _specificity = function () {
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
