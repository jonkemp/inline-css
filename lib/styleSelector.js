const { calculate } = require('specificity');

module.exports = (text, spec) => {
    let cached = spec;

    return {
        specificity() {
            if (!cached) {
                const { A, B, C } = calculate(text);

                cached = [ 0, A, B, C ];
            }
            return cached;
        }
    };
};
