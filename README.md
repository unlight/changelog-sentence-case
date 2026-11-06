# changelog-sentence-case

[![npm](https://img.shields.io/npm/v/changelog-sentence-case.svg)](https://www.npmjs.com/package/changelog-sentence-case)
[![CI](https://github.com/unlight/changelog-sentence-case/actions/workflows/ci.yml/badge.svg)](https://github.com/unlight/changelog-sentence-case/actions/workflows/ci.yml)

A `conventional-changelog-writer` hook that sentence-cases commit subjects in release notes.

Commits stay lowercase, release notes do not:

```diff
  # commit message, never rewritten
  feat: add retry logic

  # generated release notes
- * add retry logic
+ * Add retry logic
```

## Install

```sh
npm install --save-dev changelog-sentence-case
```

## Usage

```js
// release.config.mjs
import { writerOpts } from 'changelog-sentence-case';

export default {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    [
      '@semantic-release/release-notes-generator',
      { preset: 'conventionalcommits', writerOpts },
    ],
    '@semantic-release/changelog',
    '@semantic-release/git',
    '@semantic-release/github',
  ],
};
```

That is the whole integration. `writerOpts` is a one-key object — `{ finalizeContext }` — so it is merged over the preset's writer options (`{ ...loadedConfig.writer, ...writerOpts }` in `@semantic-release/release-notes-generator`). Section grouping, sorting, commit links, issue links and `BREAKING CHANGES` rendering stay preset-owned.

Both outputs are covered by that single hook: the GitHub/GitLab release is built from `nextRelease.notes`, and `@semantic-release/changelog` writes the same string to `CHANGELOG.md` without rendering anything itself.

### Other tools

Anything that forwards `writerOpts` to `conventional-changelog-writer` works the same way — merge the object into the options you already pass:

```js
import { writerOpts } from 'changelog-sentence-case';

const options = {
  ...yourWriterOptions,
  ...writerOpts,
};
```

If `yourWriterOptions` already has a `finalizeContext`, do not spread over it: use `chainFinalizeContext` — see below.

### JSON and YAML configs are not supported

This package is a function, so it needs a JavaScript or TypeScript config: `.releaserc.js`, `.releaserc.mjs`, `release.config.js`, `release.config.mjs` and friends. `.releaserc.json`, `.releaserc.yaml` and the `release` field of `package.json` cannot express it. If your config is data-only, a `generateNotes` plugin is the only option — this package is not one and must not be put into `plugins`.

## What is changed and what is not

| Aspect                     | Behaviour                             |
| -------------------------- | ------------------------------------- |
| Commit subjects            | `add thing` → `Add thing`             |
| Scope prefix               | untouched: `**api:** Add retry logic` |
| List bullet                | untouched, `*` comes from the preset  |
| Issue references and links | untouched, produced by the preset     |
| Breaking change notes      | untouched, authored text is preserved |
| Commit messages in git     | untouched, they are never rewritten   |
| Rest of the subject        | untouched, the tail is not lowercased |

Only the first character of each subject is uppercased. Conventional commit subjects are already written in sentence case — the renderer just drops the capital. Lowercasing the tail would turn `fix CI` into `fix ci`, losing information instead of gaining style. That is a deliberate decision, not an omission.

`noteGroups` (the `### ⚠ BREAKING CHANGES` section) is intentionally not touched: those notes are free-form prose authored in the commit body, often already capitalised and multi-sentence.

## Combining with your own `finalizeContext`

```js
import { chainFinalizeContext } from 'changelog-sentence-case';

const myHook = context => ({ ...context, isPatch: false });

export default {
  plugins: [
    ['@semantic-release/commit-analyzer', { preset: 'conventionalcommits' }],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        writerOpts: { finalizeContext: chainFinalizeContext(myHook) },
      },
    ],
  ],
};
```

Your hook runs after ours: it receives sentence-cased subjects, gets the same writer arguments (`options`, `filteredCommits`, `keyCommit`, `commits`) and has the final say. A non-function value is ignored, so passing through user input is safe.

## API

```js
import { writerOpts, chainFinalizeContext } from 'changelog-sentence-case';
```

| Export                 | Description                                                   |
| ---------------------- | ------------------------------------------------------------- |
| `writerOpts`           | `{ finalizeContext }`, ready to pass to a `writerOpts` option |
| `chainFinalizeContext` | `(existingHook?) => hook`, composes your hook after ours      |

One type is exported: `FinalizeContextHook`, for annotating your own hook in TypeScript. The hook returns a new context object and never mutates the one it receives.

## Compatibility

- `conventional-changelog-writer` 8.x — the version shipped with `@semantic-release/release-notes-generator` 14 and `semantic-release` 25.
- `conventional-changelog-conventionalcommits` must be 9.x. Version 10 requires `conventional-changelog-writer` 9 and fails inside `generateNotes` with `Missing helper: ... requires conventional-changelog-writer@9 or newer`.
- The hook is writer-level, so any preset works, not just `conventionalcommits`; `conventionalcommits` is the one covered by the test suite.
- Node.js >= 20.19, ESM only.

## License

MIT
