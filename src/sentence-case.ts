/**
 * Minimal shape of a commit as rendered by `conventional-changelog-writer`.
 */
export interface CommitLike {
  [key: string]: unknown;
  subject?: null | string;
}

/**
 * Minimal shape of a commit group in the writer template context.
 */
export interface CommitGroupLike<Commit extends CommitLike = CommitLike> {
  [key: string]: unknown;
  commits: Commit[];
}

/**
 * Minimal shape of the writer template context that we need to touch.
 */
export interface ContextLike<Commit extends CommitLike = CommitLike> {
  [key: string]: unknown;
  commitGroups?: CommitGroupLike<Commit>[];
}

/**
 * Signature of the `conventional-changelog-writer` `finalizeContext` hook.
 */
export type FinalizeContextHook = (
  context: ContextLike,
  ...args: unknown[]
) => ContextLike | Promise<ContextLike>;

/**
 * Uppercases the first character and leaves the rest untouched.
 * Conventional commits are already written in sentence case except for that first letter.
 */
export const sentenceCase = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1);
