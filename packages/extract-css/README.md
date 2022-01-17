# extract-css

[![NPM](https://nodei.co/npm/extract-css.png?downloads=true)](https://nodei.co/npm/extract-css/)

> Extract the CSS from an HTML document.

## Install

Install with [npm](https://npmjs.org/package/extract-css)

```
npm install --save extract-css
```

## Usage

```js
var extractCss = require('extract-css');
var options = {
      url: './',
      applyStyleTags: true,
      removeStyleTags: true,
      applyLinkTags: true,
      removeLinkTags: true,
      preserveMediaQueries: false
  };

extractCss(document, options, function (err, html, css) {
    console.log(html);
    console.log(css);
});
```

## API

### extractCss(html, options, callback)

#### options.applyStyleTags

Type: `Boolean`  

Whether to inline styles in `<style></style>`.


#### options.applyLinkTags

Type: `Boolean`  

Whether to resolve `<link rel="stylesheet">` tags and inline the resulting styles.


#### options.removeStyleTags

Type: `Boolean`  

Whether to remove the original `<style></style>` tags after (possibly) inlining the css from them.


#### options.removeLinkTags

Type: `Boolean`  

Whether to remove the original `<link rel="stylesheet">` tags after (possibly) inlining the css from them.


#### options.url

Type: `String`  

How to resolve hrefs. Required.

#### options.preserveMediaQueries

Type: `Boolean`  

Preserves all media queries (and contained styles) within `<style></style>` tags as a refinement when `removeStyleTags` is `true`. Other styles are removed.

#### options.codeBlocks

Type: `Object`  
Default: `{ EJS: { start: '<%', end: '%>' }, HBS: { start: '{{', end: '}}' } }`

An object where each value has a `start` and `end` to specify fenced code blocks that should be ignored during parsing. For example, Handlebars (hbs) templates are `HBS: {start: '{{', end: '}}'}`. Note that `codeBlocks` is a dictionary which can contain many different code blocks, so don't do `codeBlocks: {...}` do `codeBlocks.myBlock = {...}`.

### Special markup

#### data-embed

When a data-embed attribute is present on a <style></style> tag, extract-css will not inline the styles and will not remove the <style></style> tags.

This can be used to embed email client support hacks that rely on css selectors into your email templates.

## Credit

The code for this module was originally taken from the [Juice](https://github.com/Automattic/juice) library.

## License

MIT © [Jonathan Kemp](http://jonkemp.com)
