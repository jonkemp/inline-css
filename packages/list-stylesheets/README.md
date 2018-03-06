# list-stylesheets [![Build Status](https://travis-ci.org/jonkemp/list-stylesheets.svg?branch=master)](https://travis-ci.org/jonkemp/list-stylesheets) [![Coverage Status](https://coveralls.io/repos/jonkemp/list-stylesheets/badge.svg?branch=master&service=github)](https://coveralls.io/github/jonkemp/list-stylesheets?branch=master)

[![NPM](https://nodei.co/npm/list-stylesheets.png?downloads=true)](https://nodei.co/npm/list-stylesheets/)

> Get a list of stylesheets from an HTML document.

## Install

Install with [npm](https://npmjs.org/package/list-stylesheets)

```
npm install --save list-stylesheets
```

## Usage

```js
var getStylesheetList = require('list-stylesheets');

var data = getStylesheetList(html, options);

console.log(data.html);
console.log(data.hrefs);
```

## API

### getStylesheetList(html, options)

#### options.applyLinkTags

Type: `Boolean`  
Default: `true`

Whether to resolve `<link rel="stylesheet">` tags and inline the resulting styles.

#### options.removeLinkTags

Type: `Boolean`  
Default: `true`

Whether to remove the original `<link rel="stylesheet">` tags after (possibly) inlining the css from them.

#### options.codeBlocks

Type: `Object`  
Default: `{ EJS: { start: '<%', end: '%>' }, HBS: { start: '{{', end: '}}' } }`

An object where each value has a `start` and `end` to specify fenced code blocks that should be ignored during parsing. For example, Handlebars (hbs) templates are `HBS: {start: '{{', end: '}}'}`. Note that `codeBlocks` is a dictionary which can contain many different code blocks, so don't do `codeBlocks: {...}` do `codeBlocks.myBlock = {...}`.

### cheerio options

Options to passed to [cheerio](https://github.com/cheeriojs/cheerio).

## Credit

The code for this module was originally taken from the [Juice](https://github.com/Automattic/juice) library.

## License

MIT © [Jonathan Kemp](http://jonkemp.com)
