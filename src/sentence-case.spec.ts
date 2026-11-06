import { describe, expect, it } from 'vitest';

import { sentenceCase } from './sentence-case.ts';

describe('sentenceCase', () => {
  it.each([
    ['add thing', 'Add thing'],
    ['fix CI', 'Fix CI'],
    ['fix: typo', 'Fix: typo'],
    ['Add already', 'Add already'],
    ['', ''],
    ['добавить команду', 'Добавить команду'],
    ['[skip ci] add thing', '[skip ci] add thing'],
    ['123 add', '123 add'],
  ])('%s -> %s', (input, expected) => {
    expect(sentenceCase(input)).toBe(expected);
  });
});
