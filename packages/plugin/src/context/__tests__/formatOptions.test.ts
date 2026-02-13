import path from 'node:path';

import { DEFAULT_EXCLUDE, DEFAULT_INCLUDE } from '../../constants';
import { formatOptions } from '../formatOptions';

describe(formatOptions, () => {
  describe('default values', () => {
    it('should return enabled true by default', () => {
      const result = formatOptions({});

      expect(result.enabled).toBe(true);
    });

    it('should return default include pattern', () => {
      const result = formatOptions({});

      expect(result.include).toEqual(DEFAULT_INCLUDE);
    });

    it('should include DEFAULT_EXCLUDE in exclude by default', () => {
      const result = formatOptions({});

      expect(result.exclude).toEqual(DEFAULT_EXCLUDE);
    });

    it('should return throwOnError true by default', () => {
      const result = formatOptions({});

      expect(result.throwOnError).toBe(true);
    });

    it('should return debug false by default', () => {
      const result = formatOptions({});

      expect(result.debug).toBe(false);
    });

    it('should return empty outputFilePath by default', () => {
      const result = formatOptions({});

      expect(result.outputFilePath).toBe('');
    });

    it('should return default formatOutModulePath function', () => {
      const result = formatOptions({});

      expect(typeof result.formatOutModulePath).toBe('function');
    });

    it('should return default formatOut function', () => {
      const result = formatOptions({});

      expect(typeof result.formatOut).toBe('function');
    });

    it('should return default ignoreCycle that returns false', () => {
      const result = formatOptions({});

      expect(result.ignoreCycle(['a.ts', 'b.ts'])).toBe(false);
    });

    it('should return noop onStart callback', () => {
      const result = formatOptions({});

      expect(result.onStart({} as never)).toBeUndefined();
    });

    it('should return noop onDetected callback', () => {
      const result = formatOptions({});

      expect(result.onDetected('path', {} as never)).toBeUndefined();
    });

    it('should return noop onEnd callback', () => {
      const result = formatOptions({});

      expect(result.onEnd({ rawOutput: {}, formattedOutput: '', metrics: {} as never }, {} as never)).toBeUndefined();
    });
  });

  describe('user-provided values', () => {
    it('should accept enabled false', () => {
      const result = formatOptions({ enabled: false });

      expect(result.enabled).toBe(false);
    });

    it('should accept custom include pattern', () => {
      const include = [/\.vue$/];

      const result = formatOptions({ include });

      expect(result.include).toEqual([/\.vue$/]);
    });

    it('should merge custom exclude with defaults', () => {
      const customExclude = /test/;

      const result = formatOptions({ exclude: customExclude });

      expect(result.exclude).toEqual([customExclude, ...DEFAULT_EXCLUDE]);
    });

    it('should merge array exclude with defaults', () => {
      const customExclude = [/test/, /spec/];

      const result = formatOptions({ exclude: customExclude });

      expect(result.exclude).toEqual([...customExclude, ...DEFAULT_EXCLUDE]);
    });

    it('should return DEFAULT_EXCLUDE for falsy exclude value', () => {
      const result = formatOptions({ exclude: null as never });

      expect(result.exclude).toEqual(DEFAULT_EXCLUDE);
    });

    it('should accept custom formatOutModulePath', () => {
      const customFn = (p: string) => p.toUpperCase();

      const result = formatOptions({ formatOutModulePath: customFn });

      expect(result.formatOutModulePath).toBe(customFn);
    });

    it('should accept custom formatOut', () => {
      const customFn = () => 'custom';

      const result = formatOptions({ formatOut: customFn });

      expect(result.formatOut).toBe(customFn);
    });

    it('should accept custom ignoreCycle', () => {
      const customFn = (paths: string[]) => paths.includes('ignored.ts');

      const result = formatOptions({ ignoreCycle: customFn });

      expect(result.ignoreCycle(['ignored.ts'])).toBe(true);
      expect(result.ignoreCycle(['other.ts'])).toBe(false);
    });
  });

  describe('outputFilePath normalization', () => {
    it('should resolve relative path to absolute', () => {
      const result = formatOptions({ outputFilePath: 'dist/output.json' });

      expect(path.isAbsolute(result.outputFilePath)).toBe(true);
      expect(result.outputFilePath).toContain('dist/output.json');
    });

    it('should keep absolute path unchanged', () => {
      const absolutePath = '/tmp/circular-deps/output.json';

      const result = formatOptions({ outputFilePath: absolutePath });

      expect(result.outputFilePath).toBe(absolutePath);
    });

    it('should keep empty string as is', () => {
      const result = formatOptions({ outputFilePath: '' });

      expect(result.outputFilePath).toBe('');
    });
  });

  describe('validation', () => {
    it('should throw for non-string outputFilePath', () => {
      expect(() => formatOptions({ outputFilePath: 123 as unknown as string }))
        .toThrow('[circular-dependencies] "outputFilePath" must be a string');
    });

    it('should throw for non-function formatOutModulePath', () => {
      expect(() => formatOptions({ formatOutModulePath: 'not-a-fn' as never }))
        .toThrow('[circular-dependencies] "formatOutModulePath" must be a function');
    });

    it('should throw for non-function formatOut', () => {
      expect(() => formatOptions({ formatOut: {} as never }))
        .toThrow('[circular-dependencies] "formatOut" must be a function');
    });

    it('should throw for non-function ignoreCycle', () => {
      expect(() => formatOptions({ ignoreCycle: true as never }))
        .toThrow('[circular-dependencies] "ignoreCycle" must be a function');
    });

    it('should throw for non-function onStart', () => {
      expect(() => formatOptions({ onStart: 42 as never }))
        .toThrow('[circular-dependencies] "onStart" must be a function');
    });

    it('should throw for non-function onDetected', () => {
      expect(() => formatOptions({ onDetected: [] as never }))
        .toThrow('[circular-dependencies] "onDetected" must be a function');
    });

    it('should throw for non-function onEnd', () => {
      expect(() => formatOptions({ onEnd: 'string' as never }))
        .toThrow('[circular-dependencies] "onEnd" must be a function');
    });

    it('should not throw for valid options', () => {
      expect(() => formatOptions({
        enabled: true,
        outputFilePath: 'output.json',
        formatOutModulePath: (p) => p,
        formatOut: () => '',
        ignoreCycle: () => false,
        onStart: () => undefined,
        onDetected: () => undefined,
        onEnd: () => undefined,
      })).not.toThrow();
    });
  });

  describe('default formatOutModulePath', () => {
    it('should return relative path from cwd', () => {
      const result = formatOptions({});
      const absolutePath = path.join(process.cwd(), 'src', 'index.ts');

      const formatted = result.formatOutModulePath(absolutePath);

      expect(formatted).toBe(path.join('src', 'index.ts'));
    });
  });

  describe('default formatOut', () => {
    it('should use Pretty formatter when outputFilePath is empty', () => {
      const result = formatOptions({});
      const data = { 'entry.ts': [['a.ts', 'b.ts', 'a.ts']] };

      const output = result.formatOut(data);

      expect(output).toContain('entry.ts');
      expect(output).toContain('a.ts');
    });

    it('should use JSON formatter when outputFilePath is set', () => {
      const result = formatOptions({ outputFilePath: '/tmp/out.json' });
      const data = { 'entry.ts': [['a.ts', 'b.ts', 'a.ts']] };

      const output = result.formatOut(data);

      expect(JSON.parse(output as string)).toEqual(data);
    });
  });
});
