## Proposal

Release `inline-css` 5.0.0 to improve resource access controls, CSS correctness, template integrity, and runtime compatibility. This proposal covers 16 issues. The maintainer has selected the compatibility direction below; numeric resource limits remain release-candidate defaults pending representative workload validation and RC feedback.

## Proposed task list

- [ ] Restrict stylesheet file/network access through explicit permissions, including redirect and destination checks.
- [ ] Update vulnerable dependencies and review remaining security advisories.
- [ ] Bound stylesheet loading with deadlines, byte limits, resource counts, concurrency limits, and cancellation.
- [ ] Preserve selector specificity for `!important` declarations, including existing inline styles.
- [ ] Preserve shorthand/longhand precedence and fallback declarations.
- [ ] Respect document order when combining linked and embedded stylesheets.
- [ ] Align declared Node.js support with the actual runtime requirements.
- [ ] Compare specificity components numerically.
- [ ] Accept empty style elements without errors or repeated callbacks.
- [ ] Parse selector lists correctly around brackets, parentheses, quoted strings, and escapes.
- [ ] Honor media attributes on style and link elements without applying conditional CSS unconditionally.
- [ ] Preserve media queries from linked stylesheets and extra CSS when requested.
- [ ] Prevent selector removal from breaking retained CSS.
- [ ] Treat custom template delimiters as literal strings and validate their definitions.
- [ ] Prevent template placeholder collisions from replacing literal input.
- [ ] Handle inherited object-key names safely so they cannot suppress valid CSS declarations.

## Proposed compatibility changes

- Require **Node.js 22.12.0 or later**.
- Deny external stylesheet access by default. Allow file access through an explicit root directory and HTTP(S) access through an explicit origin allowlist. Private-network access requires a separate opt-in.
- Add finite configurable resource limits. RC candidate defaults: a 10-second whole resource-loading deadline, 1 MiB decoded CSS per stylesheet, 10 MiB total loaded CSS, 32 stylesheet loads, four concurrent loads, and five redirects. Values remain provisional pending production workload validation; inline/embedded CSS is outside these loading budgets.
- Keep the built-in loader direct-only: explicitly disable automatic environment proxies. Configurable proxy support is deferred. Proxy-dependent applications can fetch authorized CSS through their own proxy-aware client and supply it as embedded styles in source order, with media conditions preserved and library link fetching disabled. Applications own the controls for that prefetch path.
- Reject `removeHtmlSelectors: true` when CSS or stylesheet links are retained, rather than removing selectors those styles may require.
- Validate recognized options while tolerating unknown keys. Reject invalid known options with `Error` objects and stable error codes, and propagate internal failures.
- Allow corrected CSS output to differ from 4.x, including declaration order and retained fallback declarations. Byte-identical serialization is not a compatibility goal.
- Retain the CommonJS `inlineCss(html, options) -> Promise<string>` entry point and required `options.url`. Independently published workspace packages will receive appropriate version bumps for their own breaking changes.

## Outside the required scope

General nested-media and other at-rule support, relative asset URL rebasing, width/table attribute conversion redesign, broader option cleanup, and a new public diagnostics API are deferred. These can be tracked separately without expanding the required 16-issue scope.

## Release criteria

- All 16 issues have passing regression tests.
- Conditional CSS stays conditional, template content round-trips correctly, and retained styles keep the selectors they require.
- Clean installs pass on the minimum supported Node version and supported LTS lines.
- Dependency audits are reviewed, with no unresolved high/critical alerts.
- Packed npm artifacts and clean consumer installs resolve the intended workspace package versions.
- Breaking changes have migration documentation and runnable examples.
- A release candidate is validated before stable publication.
- Numeric resource limits are reviewed against representative consumer workloads and RC feedback before the compatibility policy is finalized. Any unavailable production evidence is explicitly recorded.

## Initial workload evidence

Seven public email templates and eight derived local-load cases fit the proposed byte/count limits. The largest measured stylesheet was 33,835 decoded bytes; derived cases used at most two stylesheet loads. Six direct public CSS downloads took 0.17–0.33 seconds and followed no redirects. This is a small illustrative corpus measured with current 4.0.3 and curl, not a test of unimplemented 5.0 enforcement or production tail latency. Aggregate limits, high load counts, concurrency, redirects and slow-network behavior still require validation.

Feedback is especially welcome from consumers with large or slow workloads and proxy-only egress requirements. The issue remains a scope/compatibility proposal; the implementation sequence is maintained separately.
