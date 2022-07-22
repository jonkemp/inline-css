# css-rules

[![NPM](https://nodei.co/npm/css-rules.png?downloads=true)](https://nodei.co/npm/css-rules/)

> Returns a parse tree for a CSS source.

## Install

Install with [npm](https://npmjs.org/package/css-rules)

```
npm install --save css-rules
```

## Usage

```js
var parseCSS = require('css-rules');

var rules = parseCSS(css);

rules.forEach(function (rule) {
    console.log(rule[0]);
    console.log(rule[1]);
});
```

## Credit

The code for this module was originally taken from the [Juice](https://github.com/Automattic/juice) library.

## License

MIT
