# style-data [![Build Status](https://travis-ci.org/jonkemp/style-data.svg?branch=master)](https://travis-ci.org/jonkemp/style-data) [![Coverage Status](https://coveralls.io/repos/jonkemp/style-data/badge.svg?branch=master&service=github)](https://coveralls.io/github/jonkemp/style-data?branch=master)

[![NPM](https://nodei.co/npm/style-data.png?downloads=true)](https://nodei.co/npm/style-data/)

> Get the content of style tags.

## Install

Install with [npm](https://npmjs.org/package/style-data)

```
npm install --save style-data
```

## Usage

```js
var getStylesData = require('style-data');

getStylesData(html, options, function (err, results) {
    console.log(results.html);  // resulting html
    console.log(results.css);   // array of css rules
});
```

## API

### getStylesData(html, options, callback)

#### options.applyStyleTags

Type: `Boolean`  
Default: `true`

Whether to inline styles in `<style></style>`.

#### options.removeStyleTags

Type: `Boolean`  
Default: `true`

Whether to remove the original `<style></style>` tags after (possibly) inlining the css from them.

#### options.preserveMediaQueries

Type: `Boolean`  
Default: `false`

Preserves all media queries (and contained styles) within `<style></style>` tags as a refinement when `removeStyleTags` is `true`. Other styles are removed.

### cheerio options

Options to passed to [cheerio](https://github.com/cheeriojs/cheerio).

## Credit

The code for this module was originally taken from the [Juice](https://github.com/Automattic/juice) library.

## License

MIT © [Jonathan Kemp](http://jonkemp.com)
