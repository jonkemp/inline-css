# extract-css

## 4.0.0-rc.1

### Major Changes

- Require Node 22.12+, enforce explicit bounded stylesheet permissions, preserve CSS cascade and media conditions, and protect literal template blocks without collisions. Update standalone loader and parser contracts. See the root migration guide for compatibility changes. The root inline-css package is versioned explicitly because it is outside the workspace package list.

### Patch Changes

- Updated dependencies
  - href-content@3.0.0-rc.1
  - list-stylesheets@3.0.0-rc.1
  - style-data@3.0.0-rc.1
  - inline-css-template-blocks@1.0.0-rc.1
  - resource-policy@1.0.0-rc.1

## 3.0.2

### Patch Changes

- Replace batch with async package
