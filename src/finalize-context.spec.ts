import { describe, expect, it, vi } from 'vitest';

import { chainFinalizeContext, finalizeContext } from './finalize-context.ts';

import type { ContextLike, FinalizeContextHook } from './sentence-case.ts';

const withTitle = (context: ContextLike) => ({ ...context, title: 'custom' });

const passthrough = (context: ContextLike) => context;

const asyncPassthrough: FinalizeContextHook = () =>
  Promise.resolve({ commitGroups: undefined, title: 'async' });

const createContext = () => ({
  commitGroups: [
    {
      commits: [
        { hash: 'a1', subject: 'add thing', type: 'feat' },
        { hash: 'b2', subject: 'fix CI', type: 'fix' },
      ],
      title: 'Features',
    },
    {
      commits: [{ hash: 'c3', subject: '' }],
      title: 'Bug Fixes',
    },
  ],
  version: '1.0.0',
});

describe('finalizeContext', () => {
  it('capitalises every subject', () => {
    const result = finalizeContext(createContext());

    expect(
      result.commitGroups?.map(group => group.commits.map(c => c.subject)),
    ).toEqual([['Add thing', 'Fix CI'], ['']]);
  });

  it('keeps other context and commit fields', () => {
    const result = finalizeContext(createContext());
    const [firstGroup] = result.commitGroups ?? [];

    expect(result.version).toBe('1.0.0');
    expect(firstGroup?.title).toBe('Features');
    expect(firstGroup?.commits[0]).toMatchObject({
      hash: 'a1',
      type: 'feat',
    });
  });

  it('keeps the commit type untouched', () => {
    const result = finalizeContext({
      commitGroups: [{ commits: [{ subject: 'typo', type: 'fix' }] }],
    });

    expect(result.commitGroups?.[0]?.commits[0]).toMatchObject({
      subject: 'Typo',
      type: 'fix',
    });
  });

  it('does not mutate the input', () => {
    const context = createContext();

    finalizeContext(context);

    expect(context.commitGroups[0]?.commits[0]?.subject).toBe('add thing');
  });

  it('returns the same object when there are no commit groups', () => {
    const context = { version: '1.0.0' };

    expect(finalizeContext(context)).toBe(context);
  });

  it('returns the same object when commitGroups is not an array', () => {
    const context = {
      commitGroups: 'nope',
      version: '1.0.0',
    } as unknown as ContextLike;

    expect(finalizeContext(context)).toBe(context);
  });

  it('skips commits without a string subject', () => {
    const context = {
      commitGroups: [
        // eslint-disable-next-line unicorn/no-null -- writer can hand back a null subject
        { commits: [{ subject: null }, {}, { subject: 'add thing' }] },
      ],
    };

    const subjects = finalizeContext(context).commitGroups?.[0]?.commits.map(
      commit => commit.subject,
    );

    expect(subjects?.[0]).toBeNull();
    expect(subjects?.[1]).toBeUndefined();
    expect(subjects?.[2]).toBe('Add thing');
  });

  it('keeps note groups untouched', () => {
    const context = {
      commitGroups: [{ commits: [{ subject: 'add thing' }] }],
      noteGroups: [
        { notes: [{ text: 'node 18 is no longer supported' }], title: '⚠' },
      ],
    };

    expect(finalizeContext(context).noteGroups).toEqual(context.noteGroups);
  });
});

describe('chainFinalizeContext', () => {
  const context = { commitGroups: [{ commits: [{ subject: 'add thing' }] }] };

  it('returns the capitalised context without a user hook', async () => {
    const result = await chainFinalizeContext()(context);

    expect(result.commitGroups?.[0]?.commits[0]?.subject).toBe('Add thing');
  });

  it('ignores a non-function hook', async () => {
    const result = await chainFinalizeContext('nope')(context);

    expect(result.commitGroups?.[0]?.commits[0]?.subject).toBe('Add thing');
  });

  it('runs the user hook after capitalisation', async () => {
    const userHook = vi.fn(withTitle);

    const result = await chainFinalizeContext(userHook)(context);

    expect(userHook).toHaveBeenCalledWith(
      expect.objectContaining({
        commitGroups: [{ commits: [{ subject: 'Add thing' }] }],
      }),
    );
    expect(result).toMatchObject({ title: 'custom' });
  });

  it('forwards the remaining writer arguments to the user hook', async () => {
    const userHook = vi.fn(passthrough);
    const options = { debug: vi.fn() };

    await chainFinalizeContext(userHook)(
      context,
      options,
      [],
      // eslint-disable-next-line unicorn/no-null -- writer passes null when there is no key commit
      null,
      [],
    );

    expect(userHook).toHaveBeenCalledWith(
      expect.anything(),
      options,
      [],
      // eslint-disable-next-line unicorn/no-null -- same null key commit as above
      null,
      [],
    );
  });

  it('awaits an async user hook', async () => {
    await expect(
      chainFinalizeContext(asyncPassthrough)(context),
    ).resolves.toMatchObject({
      title: 'async',
    });
  });
});
