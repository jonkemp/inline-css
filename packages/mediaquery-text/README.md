# mediaquery-text

[![NPM](https://nodei.co/npm/mediaquery-text.png?downloads=true)](https://nodei.co/npm/mediaquery-text/)

> Returns Media Query text for a CSS source.

## Install

Install with [npm](https://npmjs.org/package/mediaquery-text)

```
npm install --save mediaquery-text
```

## Usage

```js
var mediaQueryText = require('mediaquery-text');

var mediaQueries = mediaQueryText(css);

console.log(mediaQueries);  // @media only screen and (min-width: 35em) {}
```

## Credit

The code for this module was originally taken from the [Juice](https://github.com/Automattic/juice) library.

## License

MIT
