# href-content

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
