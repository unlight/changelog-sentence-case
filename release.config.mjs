// Dogfooding: the package resolves itself through its own `exports`, so `dist` must be built.
import { writerOpts } from 'changelog-sentence-case';

/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: ['master', 'next'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        writerOpts,
      },
    ],
    '@semantic-release/changelog',
    [
      '@semantic-release/npm',
      {
        pkgRoot: './dist',
      },
    ],
    '@semantic-release/github',
    '@semantic-release/git',
  ],
};
