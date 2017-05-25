# inline-css [![npm](http://img.shields.io/npm/v/inline-css.svg?style=flat)](https://badge.fury.io/js/inline-css) [![Build Status](https://travis-ci.org/jonkemp/inline-css.svg?branch=master)](https://travis-ci.org/jonkemp/inline-css) [![Coverage Status](https://coveralls.io/repos/jonkemp/inline-css/badge.svg?branch=master&service=github)](https://coveralls.io/github/jonkemp/inline-css?branch=master)

[![NPM](https://nodei.co/npm/inline-css.png?downloads=true)](https://nodei.co/npm/inline-css/)

> Inline your CSS properties into the `style` attribute in an html file. Useful for emails.

Inspired by the [juice](https://github.com/Automattic/juice) library.

## Why inline-css instead of Juice?
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

How to resolve hrefs. Must be a string of one character or more. **Required**.

Relative urls in links will have this value prepended to them. So these links:
* `<a href="page-relative">Page</a>`
* `<a href="/root-relative">Root</a>` <- _note leading /_


With this option:
```js
inlineCss(html, { url: 'http://example.com/mushroom'})
    .then(function(html) { console.log(html); });
```

Will result in

* `<a href="http://example.com/mushroom/page-relative">Page</a>`
* `<a href="http://example.com/root-relative">Root</a>`

If you don't need this feature, simply set the property to a short string eg `{url: ' '}` (one space) and everything will work.

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

#### options.applyAttributesTo

Type: `Object`  
Default: `null`

One or more maps of rules to be set as attributes, per element. 1:1 maps can be set as arrays, as JSON otherwise _e.g._ `background-color` to `bg-color`.

#### options.removeHtmlSelectors

Type: `Boolean`  
Default: `false`

Whether to remove the `class` and `id` attributes from the markup.

### cheerio options

Options to passed to [cheerio](https://github.com/cheeriojs/cheerio).

## Contributing

See the [CONTRIBUTING Guidelines](https://github.com/jonkemp/inline-css/blob/master/CONTRIBUTING.md)

## License

MIT © [Jonathan Kemp](http://jonkemp.com)
