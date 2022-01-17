# inline-css [![npm](http://img.shields.io/npm/v/inline-css.svg?style=flat)](https://badge.fury.io/js/inline-css) ![Build Status](https://github.com/jonkemp/inline-css/actions/workflows/main.yml/badge.svg?branch=master) [![Coverage Status](https://coveralls.io/repos/jonkemp/inline-css/badge.svg?branch=master&service=github)](https://coveralls.io/github/jonkemp/inline-css?branch=master)

[![NPM](https://nodei.co/npm/inline-css.png?downloads=true)](https://nodei.co/npm/inline-css/)

> Inline your CSS properties into the `style` attribute in an html file. Useful for emails.

Inspired by the [juice](https://github.com/Automattic/juice) library.

## Features
- Uses [cheerio](https://github.com/cheeriojs/cheerio) instead of jsdom
- Works on Windows
- Preserves Doctype
- Modular
- Gets your CSS automatically through style and link tags
- Functions return [A+ compliant](https://promisesaplus.com/) Promises

## How It Works

This module takes html and inlines the CSS properties into the style attribute.

`/path/to/file.html`:
```html
<html>
<head>
  <style>
    p { color: red; }
  </style>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <p>Test</p>
</body>
</html>
```

`style.css`
```css
p {
  text-decoration: underline;
}
```

Output:
```html
<html>
<head>
</head>
<body>
  <p style="color: red; text-decoration: underline;">Test</p>
</body>
</html>
```

## What is this useful for ?

- HTML emails. For a comprehensive list of supported selectors see
[here](http://www.campaignmonitor.com/css/)
- Embedding HTML in 3rd-party websites.
- Performance. Downloading external stylesheets delays the rendering of the page in the browser. Inlining CSS speeds up this process because the browser doesn't have to wait to download an external stylesheet to start rendering the page.


## Install

Install with [npm](https://npmjs.org/package/inline-css)

```
npm install --save inline-css
```

## Usage

```js
var inlineCss = require('inline-css');
var html = "<style>div{color:red;}</style><div/>";

inlineCss(html, options)
    .then(function(html) { console.log(html); });
```

## API

### inlineCss(html, options)


#### options.extraCss

Type: `String`  
Default: `""`

Extra css to apply to the file.


#### options.applyStyleTags

Type: `Boolean`  
Default: `true`

Whether to inline styles in `<style></style>`.


#### options.applyLinkTags

Type: `Boolean`  
Default: `true`

Whether to resolve `<link rel="stylesheet">` tags and inline the resulting styles.


#### options.removeStyleTags

Type: `Boolean`  
Default: `true`

Whether to remove the original `<style></style>` tags after (possibly) inlining the css from them.


#### options.removeLinkTags

Type: `Boolean`  
Default: `true`

Whether to remove the original `<link rel="stylesheet">` tags after (possibly) inlining the css from them.

#### options.url

Type: `String`  
Default: `filePath`

How to resolve hrefs. **Required**.

#### options.preserveMediaQueries

Type: `Boolean`  
Default: `false`

Preserves all media queries (and contained styles) within `<style></style>` tags as a refinement when `removeStyleTags` is `true`. Other styles are removed.

#### options.applyWidthAttributes

Type: `Boolean`  
Default: `false`

Whether to use any CSS pixel widths to create `width` attributes on elements.

#### options.applyTableAttributes

Type: `Boolean`  
Default: `false`

Whether to apply the `border`, `cellpadding` and `cellspacing` attributes to `table` elements.

#### options.removeHtmlSelectors

Type: `Boolean`  
Default: `false`

Whether to remove the `class` and `id` attributes from the markup.

#### options.codeBlocks

Type: `Object`  
Default: `{ EJS: { start: '<%', end: '%>' }, HBS: { start: '{{', end: '}}' } }`

An object where each value has a `start` and `end` to specify fenced code blocks that should be ignored during parsing and inlining. For example, Handlebars (hbs) templates are `HBS: {start: '{{', end: '}}'}`. `codeBlocks` can fix problems where otherwise inline-css might interpret code like `<=` as HTML, when it is meant to be template language code. Note that `codeBlocks` is a dictionary which can contain many different code blocks, so don't do `codeBlocks: {...}` do `codeBlocks.myBlock = {...}`.

### Special markup

#### data-embed

When a data-embed attribute is present on a <style></style> tag, inline-css will not inline the styles and will not remove the <style></style> tags.

This can be used to embed email client support hacks that rely on css selectors into your email templates.

### cheerio options

Options to passed to [cheerio](https://github.com/cheeriojs/cheerio).

## Contributing

See the [CONTRIBUTING Guidelines](https://github.com/jonkemp/inline-css/blob/master/CONTRIBUTING.md)

## License

MIT © [Jonathan Kemp](http://jonkemp.com)
