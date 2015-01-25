# list-stylesheets

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

## Credit

The code for this module was originally taken from the [Juice](https://github.com/Automattic/juice) library.

## License

MIT © [Jonathan Kemp](http://jonkemp.com)
