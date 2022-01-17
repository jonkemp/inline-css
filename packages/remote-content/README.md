# remote-content [![Build Status](https://github.com/jonkemp/remote-content.svg?branch=master)](https://github.com/jonkemp/remote-content) [![Coverage Status](https://coveralls.io/repos/jonkemp/remote-content/badge.svg?branch=master&service=github)](https://coveralls.io/github/jonkemp/remote-content?branch=master)

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
