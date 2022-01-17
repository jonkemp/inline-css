# href-content [![Build Status](https://github.com/jonkemp/href-content.svg?branch=master)](https://github.com/jonkemp/href-content) [![Coverage Status](https://coveralls.io/repos/jonkemp/href-content/badge.svg?branch=master&service=github)](https://coveralls.io/github/jonkemp/href-content?branch=master)

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

getHrefContent('path/to/css', 'file://path/to/html', function (err, css) {
    console.log(css);
});
```

## Credit

The code for this module was originally taken from the [Juice](https://github.com/Automattic/juice) library.

## License

MIT
