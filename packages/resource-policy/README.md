# resource-policy

Requires Node.js 22.12+. Shared runtime package for inline-css 5.0.

Exports `normalizePolicy(input)`, `authorizeUrl(url, policy)`, `authorizeFile(url, policy)`, and `createLookup(policy)`. Defaults deny external access; configure exact HTTP(S) origins or an absolute file root. Private addresses need a separate opt-in. Resource contexts share finite decoded-byte budgets and one abort deadline. See the inline-css migration guide for defaults, error codes and limitations.
