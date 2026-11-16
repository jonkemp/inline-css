# Keep 5.0 helpers internal

The maintainer selected revising PR #159 to keep resource-policy and template protection internal. This supersedes the earlier proposal to publish two helper packages.

- [x] Prove a packed consumer must not install/resolve either helper package name.
- [x] Move shared source to `internal/` and unit tests to `test/internal/`.
- [x] Generate ignored `lib/internal/` copies only for existing consumers; wire pretest/prepack and explicit packed verification builds. Publish the copies inside existing tarballs, not new workspace packages.
- [x] Preserve shared resource context and configured-root identity across generated copies using versioned global symbols; prove aggregate budget enforcement in a clean packed consumer.
- [x] Declare ipaddr.js directly in every existing package consuming policy. Remove helper manifests, workspace dependencies, Changesets records and active documentation/publication instructions.
- [x] Verify all local tests/audits, eight independent tarballs, and a direct prepack hook. Independent review found no blockers.
- [ ] Push PR #159 revision and verify remote CI; no npm publication is authorized by this change.

Generated copies are never source-of-truth or committed. Each published package remains self-contained, with no imports outside its tarball. The build uses only Node filesystem APIs and retains one maintained source for each helper. Existing public APIs and the 16-issue scope remain unchanged.
