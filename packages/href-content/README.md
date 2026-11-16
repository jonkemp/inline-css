# href-content

[![NPM](https://nodei.co/npm/href-content.png?downloads=true)](https://nodei.co/npm/href-content/)

> Get content from link tags in an HTML document.

## Install

Install with [npm](https://npmjs.org/package/href-content)

```
npm install --save href-content
```

## Usage

```js
var getHrefContent = require('href-content');

getHrefContent('styles.css', 'file:///srv/templates/email.html', {
    resourcePolicy: { fileRoot: '/srv/templates' }
}, function (err, css) {
    console.log(css);
});
```

## Credit

The code for this module was originally taken from the [Juice](https://github.com/Automattic/juice) library.

## License

MIT

## 5.0 release family

Requires Node.js 22.12 or later. See the [inline-css migration guide](https://github.com/jonkemp/inline-css/blob/master/docs/migration-5.md) for the release policy and error codes.

The callback signature is now `getHrefContent(destHref, sourceHref, options, callback)`. Use `options.resourcePolicy.fileRoot` for file access or exact `allowedOrigins` for HTTP(S). Access is denied by default.
