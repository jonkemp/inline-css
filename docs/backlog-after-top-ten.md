# Backlog beyond the top ten

Reviewed 2026-11-09 against the current local 4.0.3 checkout. These are proposed issue tickets, not GitHub issues. IDs continue the earlier review's numbering. No implementation changes were made.

## Release recommendation

Use release criteria rather than an issue count. Keep the existing ten as the core 5.0 work and add six narrowly scoped correctness tickets: B11, B12, B14, B16, B17, and B18. They prevent unconditional styling, broken retained CSS, or corrupted template/output data. They largely touch extraction, selector cleanup, and template handling already involved in the plan.

B15, B19, and B20 are good additional candidates if their fixes remain contained. Defer broader at-rule preservation and option redesign rather than extending 5.0 indefinitely. Any deferred limitation needs a clear documented workaround, and release candidates must not introduce regressions in those paths.

The suggested defaults in the existing release plan remain proposals. In particular, preserve conditional styles without evaluating an imaginary browser viewport: unconditional inlining of print/responsive styles is incorrect.

## Confirmed additional issues

Every row below was reproduced with a one-off call to the public `inlineCss()` API. The common options were `{url: 'file:///tmp/input.html'}`, plus the row's options. For linked cases, a temporary CSS file was created under `/tmp`; there were no network requests. Confirmed means the observed behavior was reproduced, not that every possible downstream rendering effect was browser-tested.

| ID | Suggested target | Proposed issue | Reproduction and observed behavior | Acceptance criteria / likely files |
| --- | --- | --- | --- | --- |
| B11 | **5.0 required** | Honor `media` attributes on style and link elements | `<style media="print">p{color:red}</style><p>x</p>` produces unconditional inline red. A stylesheet link with `media="print"` also applies unconditionally. | Carry conditions through source extraction; do not inline conditional declarations as unconditional. Preserve them when requested, with the condition intact. Test both style/link tags, missing/empty/all media, print, and responsive conditions. `packages/style-data`, `packages/list-stylesheets`, `packages/extract-css`. |
| B12 | **5.0 required** | Preserve media queries from linked stylesheets | A linked CSS file containing normal declarations and `@media(max-width:600px){.x{color:blue}}` loses the media rule even with `preserveMediaQueries:true`. | Apply media preservation to every CSS source, including linked content; specify/test `extraCss` too. Retain source order and media conditions without a duplicate cascade. `packages/extract-css`, `packages/style-data`, `packages/mediaquery-text`. |
| B13 | Later fix | Preserve nested media content | `<style>@media screen{@media(min-width:1px){p{color:red}}}</style>` with `preserveMediaQueries:true` becomes an empty `@media screen {}`. | Preserve nested rule trees rather than reconstructing only direct style/font-face children. Include supports rules nested inside media in tests. `packages/mediaquery-text/index.js`. |
| B14 | **5.0 required** | Prevent selector removal from breaking retained CSS | With `preserveMediaQueries:true, removeHtmlSelectors:true`, `<style>p{color:red}@media(max-width:600px){.x{color:blue}}</style><p class="x">x</p>` retains `.x` CSS but removes `class="x"`. | Define the option interaction explicitly. Recommended: reject selector stripping when CSS is retained, rather than attempt unsafe selector dependency analysis. Cover retained media, `data-embed`, retained style/link tags, and indirect descendant selectors. `lib/inline-css.js`, `lib/removeClassId.js`, entry validation. |
| B15 | 5.0 candidate; otherwise prompt follow-up | Rebase relative asset URLs when moving linked CSS | Linked CSS in `/tmp/inline-css-backlog.css` containing `background:url(assets/a.png)` is copied unchanged into the HTML. Moving CSS to a document in another directory changes the asset's base. | Resolve CSS asset URLs against the original stylesheet URL, including the final redirect URL. Preserve data URLs, absolute URLs, fragments and templates appropriately; do not fetch assets. Use a CSS value parser. `packages/remote-content`, `packages/extract-css`, CSS parsing pipeline. |
| B16 | **5.0 required** | Treat custom template delimiters as literal text | `<p>[[ value ]]</p>` with `codeBlocks:{X:{start:'[[',end:']]'}}` throws an invalid-RegExp SyntaxError. | Escape literal delimiter text or use a literal scanner; validate empty/non-string delimiters and define overlap behavior. Test brackets, parentheses, dollar signs, backslashes, multiline blocks and multiple block kinds. `lib/inline-css.js`, `packages/list-stylesheets/index.js`, `packages/style-data/index.js`. |
| B17 | **5.0 required** | Prevent template placeholder collisions | `<p>EXCS_CODE_BLOCK_0_ {{value}}</p>` becomes `<p>{{value}} {{value}}</p>`. A literal string in the input is overwritten. | Choose collision-free placeholders after checking the input, restore only generated tokens, and share protection logic across stages. Test literal token-shaped strings in text and attributes, multiple blocks, repeated processing, and token-like content inside a block. Same three template-protection files as B16. |
| B18 | **5.0 required** | Avoid inherited object keys in CSS property storage | `<style>p{constructor:red;color:blue}</style><p>x</p>` loses all styling, including valid blue. `styleProps={}` treats inherited `constructor` as an existing property, throws during comparison, and the broad selector catch hides it. | Use own-key-safe storage or the planned declaration arrays. Unknown property names must not suppress valid declarations or alter object prototypes. Test `constructor`, `toString`, `__proto__`, custom properties, and a valid declaration before/after each. `lib/handleRule.js`, `lib/addProps.js`, `lib/inline-css.js`. This is a confirmed key-collision/output bug, not a demonstrated prototype-pollution exploit. |
| B19 | 5.0 candidate | Only create valid numeric width attributes | `<style>img{width:calc(100% - 20px)}</style><img>` with `applyWidthAttributes:true` creates `width="calc(100% - 20)"`. | Convert only supported complete pixel lengths, with a documented rounding policy; keep CSS expressions in CSS. Cover calc, variables, em/rem, percent, zero, negative values, decimal px, uppercase units, and important widths. `lib/setWidthAttrs.js`. |
| B20 | 5.0 candidate | Validate CSS-to-table-attribute conversions | With `applyTableAttributes:true`, `td{width:10rem;white-space:normal}` becomes `width="10rem" nowrap="normal"` and those CSS properties are deleted. | Use property-specific conversions. `white-space:normal` must not create `nowrap`; unrepresentable lengths/values must remain in CSS. Test supported pixel/percent values, backgrounds and alignment values as well. `lib/setTableAttrs.js`. |
| B21 | Later fix / option clarification | Apply attribute/selector options consistently to unmatched elements | `<img style="width:100px">` receives no width attribute with `applyWidthAttributes:true` unless some stylesheet rule also matches it. `<div class="unused" id="unused">` retains both selectors with `removeHtmlSelectors:true`. | Decide/document whether options act globally or only on edited elements. Prefer consistent traversal if the API promises global behavior; coordinate with B14 so cleanup cannot break retained CSS. `lib/inline-css.js`, attribute helpers. |
| B22 | Later feature / preservation policy | Preserve non-inlineable font rules when requested | `<style>@font-face{font-family:X;src:url(x.woff)}p{font-family:X}</style><p>x</p>` retains the font-family declaration but deletes the font definition under defaults. | Define an explicit preservation policy for font-face and other non-inlineable at-rules, with tests and asset rebasing where applicable. Preserve a documented `data-embed` workaround in the meantime. Do not bundle general support for all modern CSS into this ticket. `packages/style-data`, `packages/mediaquery-text`. |

### Standards behind the expected behavior

- Media attributes qualify when styles apply: [HTML style/link semantics](https://html.spec.whatwg.org/multipage/semantics.html#attr-style-media).
- Relative CSS URLs use their stylesheet's base, which matters when declarations are relocated: [CSS relative URLs](https://www.w3.org/TR/css-values-4/#relative-urls).
- Boolean attributes are true by presence, so assigning a value does not disable them: [HTML boolean attributes](https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes).

## Additional reproductions already covered by the 5.0 plan

Avoid counting these as new release workstreams, but add their exact regressions:

- **Fallback declarations disappear:** `p{display:-webkit-box;display:flex}` retains only flex. Existing Tasks 5–6 already require duplicate declaration preservation.
- **Quoted CSS values can become invalid:** `p{font-family:"A'B"}` serializes to `font-family: 'A'B';`. Task 6 already removes global quote replacement; pin this exact case with a test.
- **HTTP success depends on the reason phrase:** the remote loader checks `statusText === 'OK'`. Existing Task 4 already calls for numeric HTTP status handling.
- **Release gates and root package discovery:** the existing plan already calls out Turbo tasks without workspace scripts, Changesets root inclusion, and the npm `version` lifecycle conflict. Treat these as release gates rather than newly discovered runtime issues.

## Investigation tickets, not confirmed defects

| ID | Priority | Investigation | Completion evidence |
| --- | --- | --- | --- |
| B23 | Before 5.0 RC | Bound synchronous processing cost as well as I/O | Benchmark many nodes/selectors, pathological selector shapes, large inline CSS, and template blocks. Network budgets do not bound HTML/CSS size or CPU work. Define supported input sizes and choose additional limits only from measured evidence. |
| B24 | Later, unless regression appears | Audit forwarded Cheerio options | `decodeEntities:false` still normalizes entities in HTML mode; determine which forwarded options are honored by the actual parser. Test case-sensitive tags/attributes, entities, XML mode, CDATA, and fragments; distinguish harmless serialization changes from corruption. Document or remove ineffective options in a major only when justified. |
| B25 | Before 5.0 RC for internal errors; later for new public diagnostics | Separate invalid selectors from internal failures | `lib/inline-css.js` catches every error from `handleRule` as an invalid selector. B18 demonstrates the visibility problem, but a general diagnostics API is new scope. Narrow the catch and test genuine internal errors propagating. Consider optional skipped-selector diagnostics later. |

## Suggested additions to the existing implementation plan

1. Extend **Task 1** with B11, B12, B14, B16, B17 and B18 regressions before refactoring.
2. Add one focused shared-template-helper task for **B16–B17**, with direct tests for all three consumers. Avoid three separate fixes that drift apart.
3. Extend **Tasks 5–6** with B18 and narrow internal-error handling from B25. Declaration arrays should eliminate the unsafe property dictionary, but verify it rather than assuming.
4. Extend **Task 7** with B11–B12 and condition-bearing source records. Specify where preserved conditional CSS is emitted after link removal; extraction must retain conditions and source provenance.
5. Add **B14** option validation after extraction reports whether CSS is retained. Update migration documentation with the new rejection and a supported alternative.
6. If time permits, fold **B19–B20** into attribute-helper validation and **B15** into source provenance/URL handling. Otherwise record exact limitations and regression coverage before declaring 5.0 ready.
7. Run **B23** measurements before the RC; use them to decide whether synchronous input budgets are release blockers. Do not equate I/O limits with complete denial-of-service protection.

## Definition of enough for 5.0

- The original ten have passing regressions and independent package-install validation.
- The six required additions above are fixed, covered, and documented.
- No known template corruption or unconditional application of conditional CSS remains in the supported paths.
- Every default change and invalid option combination has a migration example.
- Remaining work is explicitly listed here, with scope and workarounds, rather than silently implied to be supported.
- A release candidate passes realistic email/template fixtures and clean consumer installs; release success is not measured by reaching a ticket total.

Implementation remains separate from this backlog. No GitHub issues were created and no package files were changed.
