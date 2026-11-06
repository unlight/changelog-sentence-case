// Dogfooding from source: Node >= 22.18 strips types natively, so no build is needed.
// `dist` is covered by the e2e check, not by this config.
import { writerOpts } from './src/index.ts';

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
