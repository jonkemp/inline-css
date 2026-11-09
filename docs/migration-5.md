# Migrating to inline-css 5.0

5.0 requires Node.js 22.12.0 or later. CommonJS and the Promise API remain available. `options.url` is still required, including inline-only conversions. Corrected CSS output may contain repeated declarations and different ordering; compare rendered behavior rather than exact style strings.

## Inline-only conversion

```js
const inlineCss = require('inline-css');
const result = await inlineCss('<style>p{color:red}</style><p>Hello</p>', {
    url: 'https://example.com/email.html'
});
```

## Explicit external stylesheet permissions

External files and HTTP(S) resources are denied by default. A base URL is not a permission grant. Denied requested resources reject the conversion with an Error; they are not silently discarded.

```js
const result = await inlineCss(html, {
    url: 'file:///srv/templates/email.html',
    resourcePolicy: { fileRoot: '/srv/templates' }
});
```

The root must be an existing absolute directory. Canonical paths, including symlinks, must remain beneath it. File resources referenced from an HTTP document also need this permission.

```js
const result = await inlineCss(html, {
    url: 'https://example.com/email.html',
    resourcePolicy: { allowedOrigins: ['https://cdn.example.com'] }
});
```

Origins are exact, including scheme and nondefault port. Credentials in URLs and unsupported schemes are rejected. Redirect destinations require permission too. Nonpublic IP destinations, including loopback and link-local, are denied even for an allowed origin. Intentional intranet fetching requires both its origin and `allowPrivateNetworks: true`:

```js
const result = await inlineCss(html, {
    url: 'https://intranet.example/email.html',
    resourcePolicy: {
        allowedOrigins: ['https://intranet.example'],
        allowPrivateNetworks: true
    }
});
```

Supply permissions only for sources the application intends to trust. These controls do not sanitize HTML or bound every synchronous HTML/CSS computation.

## Finite resource limits

Current RC defaults, pending production workload validation:

| Option | Default |
| --- | --- |
| `timeoutMs` | 10,000 ms for all resource loading, including queued work |
| `maxStylesheetBytes` | 1,048,576 decoded bytes per loaded stylesheet |
| `maxTotalBytes` | 10,485,760 decoded loaded bytes per conversion |
| `maxStylesheets` | 32 loads, counting repeated links |
| `concurrency` | 4 active loads |
| `maxRedirects` | 5 per load |

Set finite overrides inside `resourcePolicy` for legitimate larger workloads. Positive integers are required except `maxRedirects`, which may be zero. There is no unlimited value; zero is not a way to disable a deadline. Inline/embedded CSS and application-prefetched CSS are outside these loading byte budgets. First failure aborts active loading and cancels queued work.

## Proxies

The built-in loader is direct-only. It explicitly ignores HTTP_PROXY, HTTPS_PROXY, ALL_PROXY, NO_PROXY and their lowercase variants without changing application environment variables. It has no custom proxy/agent option in 5.0.

For proxy-dependent applications, fetch each authorized stylesheet through your application's existing proxy-aware client. Enforce destination, redirect, decoded-byte and deadline controls in that client. Replace each link with the fetched style content at the same document position, retaining its media attribute; resolve relative asset URLs before relocation. Then use:

```js
const result = await inlineCss(prefetchedHtml, {
    url: 'https://example.com/email.html',
    applyLinkTags: false,
    preserveMediaQueries: true
});
```

The application must construct style elements safely; untrusted CSS must not become executable markup. `extraCss` is appropriate only when applying those declarations after all source styles preserves the intended cascade. Prefetching is application-owned I/O and is not automatically covered by the library's loader budgets.

## Media and retained selectors

CSS from `media="print"`, responsive media attributes, or other conditional sources never becomes unconditional inline declarations. Missing, empty and `all` media attributes are unconditional. `preserveMediaQueries: true` retains conditional CSS from embedded styles, fetched stylesheets and `extraCss`; tag-removal flags still control original sources.

```js
const result = await inlineCss(
    '<style media="print">p{color:red}</style><p class="message">Hello</p>',
    { url: 'https://example.com/email.html', preserveMediaQueries: true }
);
```

`removeHtmlSelectors: true` rejects when nonempty CSS or a stylesheet link remains, including media queries, `data-embed` or explicitly retained tags. Keep selectors when preserving CSS, or remove that CSS before requesting cleanup. Empty retained style blocks alone do not conflict.

## Template blocks

EJS (`<%` / `%>`) and HBS (`{{` / `}}`) remain defaults. Custom definitions extend them. Delimiters are literal nonempty strings rather than regular expressions:

```js
const result = await inlineCss('<p>[[ name ]] {{fallback}}</p>', {
    url: 'https://example.com/email.html',
    codeBlocks: { CUSTOM: { start: '[[', end: ']]' } }
});
```

The earliest opener wins; ties prefer the longest opener, then block-key order. Blocks end at their first closing delimiter and do not nest. Unmatched opening delimiters remain unchanged. Literal placeholder-shaped strings are preserved alongside real blocks.

## Errors and corrected CSS

Recognized options are validated; unknown keys are tolerated for wrappers. Rejections use Error objects, not strings. Handle `error.code` rather than matching messages:

- `ERR_INLINE_CSS_INVALID_OPTIONS`
- `ERR_INLINE_CSS_RESOURCE_DENIED`
- `ERR_INLINE_CSS_RESOURCE_TIMEOUT`
- `ERR_INLINE_CSS_RESOURCE_LIMIT`
- `ERR_INLINE_CSS_SELECTOR_RETENTION_CONFLICT`

Filesystem, network, parser and other internal errors propagate with their original identity/cause where available. Unsupported selectors retain skip behavior; arbitrary internal failures are not silently classified as selectors.

Important declarations retain specificity, inline important declarations win appropriately, specificity components compare numerically, and linked/embedded rules retain document order. Shorthand resets and repeated fallback values remain in cascade order. For example, `margin-left:10px; margin:0` now resets the left margin as a browser would. Property names that resemble inherited JavaScript fields no longer hide valid declarations.

## Independently published packages

- `css-rules` returns `{selector, declarations}` records; declarations contain `property`, `value`, `important`, and `order`.
- `href-content` becomes `(destHref, sourceHref, options, callback)`.
- `remote-content` becomes `(url, options, callback)`.
- Both loaders require explicit `options.resourcePolicy` permissions for external access.
- `extract-css` keeps its entry signature; its callback adds fourth argument `{hasRetainedCss}` after `(err, html, css)`. Its returned CSS includes only unconditional sources; conditional rules can remain in the returned HTML. Its loaders share one conversion budget.
- New shared packages supply template protection and resource policy; their defaults match the root package.

Each package receives its own appropriate version. No npm publication or stable promotion occurs merely by running the verification scripts.
