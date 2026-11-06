import { finalizeContext } from './finalize-context.ts';

import type { FinalizeContextHook } from './sentence-case.ts';

/**
 * Ready-to-use `writerOpts` for `conventional-changelog-writer`.
 * Pass it to `@semantic-release/release-notes-generator`; it is merged over the preset's options.
 */
export const writerOpts: { finalizeContext: FinalizeContextHook } = {
  finalizeContext,
};
