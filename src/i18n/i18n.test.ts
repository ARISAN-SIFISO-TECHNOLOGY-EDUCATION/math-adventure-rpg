import { describe, it, expect } from 'vitest';
import { en } from './en';
import { zu } from './zu';
import { NARRATION } from './narration';

const LOCALES = { en, zu };

/** All `{placeholder}` tokens in a string, as a sorted array. */
function placeholders(s: string): string[] {
  return [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
}

describe('i18n UI dictionaries', () => {
  const enKeys = Object.keys(en).sort();

  for (const [name, dict] of Object.entries(LOCALES)) {
    describe(name, () => {
      it('has exactly the same keys as the English source', () => {
        expect(Object.keys(dict).sort()).toEqual(enKeys);
      });

      it('has no empty strings', () => {
        for (const [k, v] of Object.entries(dict)) {
          expect(v.trim(), `${name}.${k} is empty`).not.toBe('');
        }
      });

      it('uses the same placeholders as English for every key', () => {
        for (const k of enKeys) {
          expect(
            placeholders((dict as Record<string, string>)[k]),
            `placeholder mismatch in ${name}.${k}`,
          ).toEqual(placeholders((en as Record<string, string>)[k]));
        }
      });
    });
  }
});

describe('i18n narration lines', () => {
  const langs = Object.keys(NARRATION) as (keyof typeof NARRATION)[];

  it('every language has matching correct/wrong line counts > 0', () => {
    for (const l of langs) {
      expect(NARRATION[l].correct.length, `${l}.correct`).toBeGreaterThan(0);
      expect(NARRATION[l].wrong.length, `${l}.wrong`).toBeGreaterThan(0);
    }
  });

  it('levelUp keeps the {lvl} placeholder in every language', () => {
    for (const l of langs) {
      expect(NARRATION[l].levelUp, `${l}.levelUp`).toContain('{lvl}');
    }
  });

  it('has no empty narration strings', () => {
    for (const l of langs) {
      const n = NARRATION[l];
      for (const line of [...n.correct, ...n.wrong, n.levelUp, n.victory, n.welcome, n.subitizing, n.fractionOver]) {
        expect(line.trim(), `empty narration line in ${l}`).not.toBe('');
      }
    }
  });
});
