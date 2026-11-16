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

## 5.0 release family

Requires Node.js 22.12 or later. See the [inline-css migration guide](https://github.com/jonkemp/inline-css/blob/master/docs/migration-5.md) for the release policy and error codes.

The parser now returns `[{ selector, declarations: [{ property, value, important, order }] }]`. It preserves duplicate declarations and splits selector lists using an AST. Media rules are not returned as unconditional styles.
