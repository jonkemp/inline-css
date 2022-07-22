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

getRemoteContent(remotePath, function (err, contents) {
    console.log(contents);
});
```

## Credit

The code for this module was originally taken from the [Juice](https://github.com/Automattic/juice) library.

## License

MIT
