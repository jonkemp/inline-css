# remote-content

[![NPM](https://nodei.co/npm/remote-content.png?downloads=true)](https://nodei.co/npm/remote-content/)

> Get remote content.

## Install

Install with [npm](https://npmjs.org/package/remote-content)

```
npm install --save remote-content
```

## Usage

```js
var getRemoteContent = require('remote-content');

getRemoteContent('https://example.com/styles.css', {
    resourcePolicy: { allowedOrigins: ['https://example.com'] }
}, function (err, contents) {
    console.log(contents);
});
```

## Credit

The code for this module was originally taken from the [Juice](https://github.com/Automattic/juice) library.

## License

MIT

## 5.0 release family

Requires Node.js 22.12 or later. See the [inline-css migration guide](https://github.com/jonkemp/inline-css/blob/master/docs/migration-5.md) for the release policy and error codes.

The callback signature is now `getRemoteContent(url, options, callback)`. Explicit `options.resourcePolicy.allowedOrigins` is required; private addresses require `allowPrivateNetworks: true` as well. Loading is direct-only, bounded and cancellable. Environment proxies are ignored.
