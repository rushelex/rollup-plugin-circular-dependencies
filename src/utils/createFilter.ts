import { isAbsolute, posix, win32 } from 'node:path';
import { cwd } from 'node:process';
import pm from 'picomatch';

// A valid filter pattern for picomatch
export type FilterPattern = ReadonlyArray<string | RegExp> | string | RegExp | null;

function ensureArray(thing: any) {
  if (Array.isArray(thing)) {
    // eslint-disable-next-line ts/no-unsafe-return
    return thing;
  }

  if (thing == null) {
    return [];
  }

  // eslint-disable-next-line ts/no-unsafe-return
  return [thing];
}

const normalizePathRegExp = new RegExp(`\\${win32.sep}`, 'g');
function normalizePath(filename: string) {
  return filename.replace(normalizePathRegExp, posix.sep);
}

function getMatcherString(id: string) {
  if (isAbsolute(id) || id.startsWith('**')) {
    return normalizePath(id);
  }
  // resolve('') is valid and will default to process.cwd()
  const basePath = normalizePath(cwd())
    // escape all possible (posix + win) path characters that might interfere with regex
    .replace(/[-^$*+?.()|[\]{}]/g, '\\$&');
  // Note that we use posix.join because:
  // 1. the basePath has been normalized to use /
  // 2. the incoming glob (id) matcher, also uses /
  // otherwise Node will force backslash (\) on windows
  return posix.join(basePath, normalizePath(id));
}

export function createFilter(include: FilterPattern, exclude: FilterPattern) {
  const getMatcher = (id: string | RegExp) => id instanceof RegExp
    ? id
    : {
        test: (what: string) => {
          // this refactor is a tad overly verbose but makes for easy debugging
          const pattern = getMatcherString(id);

          const fn = pm(pattern, { dot: true });
          return fn(what);
        },
      };

  const includeMatchers = ensureArray(include).map(getMatcher);
  const excludeMatchers = ensureArray(exclude).map(getMatcher);

  if (!includeMatchers.length && !excludeMatchers.length) {
    return (id: any) => typeof id === 'string' && !id.includes('\0');
  }

  return function result(id: any) {
    if (typeof id !== 'string') {
      return false;
    }

    if (id.includes('\0')) {
      return false;
    }

    const pathId = normalizePath(id);

    for (let i = 0; i < excludeMatchers.length; ++i) {
      const matcher = excludeMatchers[i];
      if (matcher.test(pathId)) {
        return false;
      }
    }

    for (let i = 0; i < includeMatchers.length; ++i) {
      const matcher = includeMatchers[i];
      if (matcher.test(pathId)) {
        return true;
      }
    }

    return !includeMatchers.length;
  };
}
