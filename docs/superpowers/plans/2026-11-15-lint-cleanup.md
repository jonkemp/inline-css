# Remove release lint warnings

Refactor the 19 warning sites without changing lint thresholds, adding rule suppressions, or changing documented positional calls.

- Split option/policy validation, template scanning, extraction scheduling/serialization, and streaming HTTP/file loading into named operations.
- Pass internal specificity/source-order and selector context as objects; unpack the public loader's options/callback tail without changing call positions.
- Separate media/style serialization, build dispatch and registry cleanup.
- Keep internal sources as the single source of truth and rebuild generated copies.
- Verify zero lint warnings, all regression/browser tests, audits and eight real packed installs. Review and push PR #159, then confirm CI.

Existing tests are the behavioral baseline; add tests only for uncovered behavior discovered during the refactor. Do not alter expected rendering or resource permissions to make lint pass.
