# mediaquery-text [![Build Status](https://travis-ci.org/jonkemp/mediaquery-text.svg?branch=master)](https://travis-ci.org/jonkemp/mediaquery-text) [![Coverage Status](https://coveralls.io/repos/jonkemp/mediaquery-text/badge.svg?branch=master&service=github)](https://coveralls.io/github/jonkemp/mediaquery-text?branch=master)

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
