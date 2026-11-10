# 5.0 compatibility decisions and resource-limit evidence

Status: selected compatibility direction recorded 2026-11-09. Numeric limits are release-candidate defaults, not a finalized production compatibility policy. This is analysis of current 4.0.3, not implementation or verification of 5.0 enforcement.

## Selected direction

The maintainer selected the highlighted recommendations in the breaking-change review:

- Node.js 22.12+; keep CommonJS, the Promise entry point, and required `options.url`.
- Explicit HTTP(S) origins and file roots; private networks require a separate opt-in. Denied requested access rejects conversion rather than silently skipping CSS.
- Finite configurable resource limits, with no unlimited setting in the proposed 5.0 policy.
- Reject selector stripping when nonempty CSS or stylesheet links remain.
- Validate recognized options, tolerate unknown option keys, and reject with `Error` objects. Preserve documented selector-skipping behavior while propagating unrelated internal errors.
- Prioritize correct CSS rendering over byte-identical serialization; independently version breaking workspace APIs.
- Disable automatic environment proxies for the built-in loader. The proxy decision is detailed below.

Add stable `error.code` values for caller handling: `ERR_INLINE_CSS_INVALID_OPTIONS`, `ERR_INLINE_CSS_RESOURCE_DENIED`, `ERR_INLINE_CSS_RESOURCE_TIMEOUT`, `ERR_INLINE_CSS_RESOURCE_LIMIT`, and `ERR_INLINE_CSS_SELECTOR_RETENTION_CONFLICT`. Preserve the original cause where wrapping is necessary. Internal errors retain their identity rather than being mislabeled as option or selector errors. These codes are an implementation recommendation accompanying the selected Error-object behavior.

## Proxy decision

The built-in 5.0 loader will be direct-only. Pass `proxy:false` explicitly to its isolated Axios client and remove the direct `proxy-from-env` dependency. Do not merely stop calling `getProxyForUrl`: Axios itself also reads environment proxy variables. Ignore `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY`, and `NO_PROXY` (including lowercase variants) for this loader without changing the application's environment or global Axios defaults.

Do not add an explicit proxy option, custom transport, or fallback to an ambient proxy in this release. Origin/private-address/redirect checks and validated DNS resolution apply to the actual direct destination. This decision avoids pretending a local DNS check establishes where a separately resolving proxy will connect.

The current loader already has environment-proxy behavior, so this is a real migration change. GitHub issue searches found proxy-related dependency/security history in [#108](https://github.com/jonkemp/inline-css/issues/108), [#126](https://github.com/jonkemp/inline-css/issues/126), and [#128](https://github.com/jonkemp/inline-css/issues/128), and a build report in [#83](https://github.com/jonkemp/inline-css/issues/83). These reports do not establish how many current consumers require proxies. Issue #158 had no comments at the time of review.

Migration for applications that require a proxy: fetch authorized CSS through the application's existing proxy-aware client, enforce its own redirect/destination/size/deadline policy, then supply the CSS as embedded style elements at the original link positions, retaining media attributes. Set `applyLinkTags:false` so the library performs no duplicate fetching. Use `extraCss` only when appending the fetched CSS at the end preserves the intended cascade. Relative asset URLs must be resolved by the application because library-level rebasing remains deferred. No application-supplied content is automatically covered by the built-in loader's resource budgets.

Acceptance tests must cover all proxy environment variants (without printing real credentials), verify no request reaches a proxy sentinel, preserve environment/global-client state, and ensure standalone `remote-content` uses the same behavior. Document that direct-only fetching can be incompatible with corporate egress policies; applications must use the prefetch path rather than relying on the old implicit proxy behavior.

## Measured workloads

Raw measurements: `2026-11-09-resource-measurements.json` and `2026-11-09-network-measurements.json` in this directory. Source commits and URLs are recorded in the JSON. Downloaded third-party template/CSS content stays under `/tmp/inline-css-5-workloads`; it is not copied into this repository.

- Inspected 57 repository HTML fixtures. Of these, 44 converted with the harness, three intentionally malformed CSS fixtures errored, and ten fixtures were skipped because their resource references were remote, templated, or unavailable to this standalone harness. This is not a replacement for the existing fixture-specific test suite.
- Used seven real public email templates: one from leemunroe/responsive-html-email-template, three Cerberus templates, and three Mailgun transactional templates, all pinned to source commits.
- The public HTML samples use embedded CSS. Created seven **derived** workloads moving that same CSS into local linked stylesheets, plus a minimal HTML harness loading the real Foundation for Emails CSS. These adaptations exercise resource sizes/counts; they are not production traces.
- All seven original and eight derived public workloads converted successfully with current 4.0.3 and fit the projected byte/count limits. This does not claim all rendered behavior is correct or that unimplemented 5.0 limits were enforced.
- Local conversion timings used one warmup plus five sequential runs per input, with every linked read local. The largest whole-conversion time in this run was 35.58 ms. That timing is not the resource-only deadline, and a five-run maximum is not a reliable tail percentile.
- Separately fetched the pinned Foundation and Mailgun CSS directly from raw.githubusercontent.com, three requests each, using curl with compression enabled and ambient proxies bypassed. All six returned HTTP 200, took 0.169–0.331 seconds, and had zero redirects. This tests one public host at one time, not regional or corporate network conditions.

| Limit | Proposed default | Largest relevant observation | Decision |
| --- | --- | --- | --- |
| Per stylesheet, decoded bytes | 1 MiB | 33,835 bytes (Foundation) | Keep for RC; about 31× headroom in this small corpus |
| Aggregate loaded CSS | 10 MiB | 33,835 bytes per derived conversion | Keep for RC; large multi-source workloads still needed |
| Stylesheet loads | 32 | 2 in derived public workloads | Keep for RC; no production support for the exact cutoff yet |
| Whole resource-loading deadline | 10 seconds | Individual direct requests up to 0.331 seconds | Keep for RC; combined queueing/DNS/redirect/slow-server behavior unvalidated |
| Concurrent loads | 4 | Corpus needs at most 2 | Keep for RC; cannot infer optimal concurrency from this sample |
| Redirects per resource | 5 | 0 in six direct requests | Keep for RC as a policy choice; multi-hop compatibility unvalidated |

Embedded CSS, inline declarations and HTML bytes do not consume the proposed external-resource byte budgets. Network compression changes transferred bytes: Foundation was 5,217 transferred bytes but 33,835 decoded bytes. Enforcement must count decoded content, not only Content-Length or wire bytes. The resource budget does not establish an overall HTML/CSS CPU or memory bound.

## Required before treating the policy as final

1. Replay sanitized consumer workload profiles or privately supplied representative samples, including their largest known templates/stylesheets and per-conversion resource counts. Ask specifically about proxy-only egress. No such production profile was supplied during this analysis.
2. Evaluate aggregate resource-loading elapsed time with realistic networks and multiple origins; record load counts, decoded bytes, redirects, and deadline/limit rejections. Capture typical and tail behavior without logging content, tokens, or sensitive URLs.
3. When the 5.0 loader exists, test exact byte/count/redirect boundaries, slow headers/bodies/DNS, decompression, cancellation and queueing. A projection or curl success does not satisfy enforcement tests.
4. Benchmark concurrency 1, 4 and 8 against the same workload; select the smallest limit that meets the application's throughput needs without uncontrolled resource use. Synthetic boundary tests can verify enforcement, but cannot establish production compatibility.
5. Document finite overrides for legitimate outliers. Any change to the RC defaults must update the public proposal, plan, tests and migration examples together.
6. Ask RC users to report actual limit-related failures and proxy migration issues before stable promotion. If no consumer data becomes available, explicitly choose to finalize with limited evidence rather than describe these defaults as production-validated.

## Reproduction

Use the source manifest embedded in the resource measurement JSON to download each source at its recorded commit into a scratch directory, preserving the recorded `localFile` names; write the recorded `sources` array to that directory's `manifest.json`. Then run:

```sh
node docs/validation/measure-resource-limits.cjs /tmp/inline-css-5-workloads
```

The script performs no network requests and deletes only its own temporary derived stylesheet directory. For network measurements, curl each pinned raw CSS URL with `--noproxy '*' --compressed --location --max-redirs 5 --max-time 10`, record status/time/redirects/transferred bytes, and measure the downloaded file's decoded byte size. Repeated timing results will vary.

References: [Axios proxy configuration](https://github.com/axios/axios/blob/v1.x/README.md#request-config), [public release proposal](https://github.com/jonkemp/inline-css/issues/158). The source corpus is illustrative and is not a statistical sample of npm consumers.
