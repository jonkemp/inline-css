# inline-css-template-blocks

Requires Node.js 22.12+. Shared runtime package for inline-css 5.0.

Exports `protect(html, codeBlocks = {})`, returning `{html, restore}`. EJS and HBS defaults are extended by custom literal, nonempty delimiters. The earliest opener wins, ties prefer the longest then block-key order, blocks do not nest, and unmatched openers remain unchanged. `restore` restores only generated placeholders and tolerates HTML attribute-name serialization. Invalid definitions throw `ERR_INLINE_CSS_INVALID_OPTIONS`.
