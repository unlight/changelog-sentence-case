import { sentenceCase } from './sentence-case.ts';

import type {
  CommitLike,
  ContextLike,
  FinalizeContextHook,
} from './sentence-case.ts';

const isFinalizeContextHook = (value: unknown): value is FinalizeContextHook =>
  typeof value === 'function';

const capitaliseCommit = (commit: CommitLike): CommitLike =>
  typeof commit.subject === 'string'
    ? { ...commit, subject: sentenceCase(commit.subject) }
    : commit;

/**
 * Returns a copy of the writer context with every commit subject sentence-cased.
 * Note groups (`BREAKING CHANGES`) are intentionally left untouched.
 */
export const finalizeContext = (context: ContextLike): ContextLike => {
  const { commitGroups } = context;

  if (!Array.isArray(commitGroups)) {
    return context;
  }

  return {
    ...context,
    commitGroups: commitGroups.map(group => ({
      ...group,
      commits: group.commits.map(commit => capitaliseCommit(commit)),
    })),
  };
};

/**
 * Composes this hook with a `finalizeContext` you already use.
 * Your hook runs last, so it sees sentence-cased subjects and has the final say.
 */
export const chainFinalizeContext = (
  existing?: unknown,
): FinalizeContextHook => {
  const userHook = isFinalizeContextHook(existing) ? existing : undefined;

  return (context, ...args) => {
    const capitalised = finalizeContext(context);

    return userHook ? userHook(capitalised, ...args) : capitalised;
  };
};
