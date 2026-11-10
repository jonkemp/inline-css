# Changelog

## 5.0.0-rc.1 (unpublished)

Release candidate for the 16-issue scope in [proposal #158](https://github.com/jonkemp/inline-css/issues/158).

- Require Node.js 22.12+, explicit stylesheet permissions, and finite loading limits; built-in fetching is direct-only.
- Correct important/numeric specificity, shorthand precedence, fallback declarations, selector lists, and linked/embedded source order.
- Honor media-qualified sources and preserve requested linked/extra CSS media rules; reject selector removal when CSS is retained.
- Accept empty styles; protect literal custom template delimiters without placeholder collisions; avoid inherited CSS-key collisions.
- Update dependencies, callback/parser contracts in companion packages, and clean package-install validation.

See [migration guidance](docs/migration-5.md). Numeric limits remain RC defaults pending representative production feedback. This candidate has not been published.
