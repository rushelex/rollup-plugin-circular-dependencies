import type { CircularDependenciesData } from '../../types';

import { DefaultFormatters } from '../formatters';

describe(DefaultFormatters.JSON, () => {
  it('should serialize data as JSON with 2-space indentation', () => {
    const data = {
      'src/a.ts': [['src/a.ts', 'src/b.ts']],
    } satisfies CircularDependenciesData;

    const result = DefaultFormatters.JSON()(data);

    expect(result).toBe(JSON.stringify(data, null, 2));
  });

  it('should return empty string for null data', () => {
    const result = DefaultFormatters.JSON()(null as never);

    expect(result).toBe('');
  });

  it('should return empty string for undefined data', () => {
    const result = DefaultFormatters.JSON()(undefined as never);

    expect(result).toBe('');
  });

  it('should return string data as-is', () => {
    const result = DefaultFormatters.JSON()('already formatted' as never);

    expect(result).toBe('already formatted');
  });

  it('should serialize empty object as JSON', () => {
    const result = DefaultFormatters.JSON()({});

    expect(result).toBe('{}');
  });
});

describe(DefaultFormatters.Pretty, () => {
  it('should format data with entry headers and arrow-separated cycles', () => {
    const data = {
      'src/a.ts': [['src/a.ts', 'src/b.ts', 'src/c.ts']],
    } satisfies CircularDependenciesData;

    const result = DefaultFormatters.Pretty({ colors: false })(data);

    expect(result).toContain('src/a.ts');
    expect(result).toContain('src/a.ts -> src/b.ts -> src/c.ts');
  });

  it('should separate multiple entries with blank lines', () => {
    const data = {
      'src/a.ts': [['src/a.ts', 'src/b.ts']],
      'src/c.ts': [['src/c.ts', 'src/d.ts']],
    } satisfies CircularDependenciesData;

    const result = DefaultFormatters.Pretty({ colors: false })(data);

    expect(result).toContain('\n\n');
  });

  it('should handle multiple cycles per entry', () => {
    const data = {
      'src/a.ts': [
        ['src/a.ts', 'src/b.ts'],
        ['src/a.ts', 'src/c.ts'],
      ],
    } satisfies CircularDependenciesData;

    const result = DefaultFormatters.Pretty({ colors: false })(data);
    const lines = result.split('\n');

    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('src/a.ts');
    expect(lines[1]).toContain('src/a.ts -> src/b.ts');
    expect(lines[2]).toContain('src/a.ts -> src/c.ts');
  });

  it('should return empty string for empty object', () => {
    const result = DefaultFormatters.Pretty({ colors: false })({});

    expect(result).toBe('');
  });

  it('should throw for invalid data structure', () => {
    expect(() => DefaultFormatters.Pretty({ colors: false })('string' as never))
      .toThrow('Pretty formatter can only be used with original output');
  });

  it('should throw for data with non-array values', () => {
    expect(() => DefaultFormatters.Pretty({ colors: false })({ key: 'not-array' } as never))
      .toThrow('Pretty formatter can only be used with original output');
  });

  it('should throw for data with empty inner arrays', () => {
    expect(() => DefaultFormatters.Pretty({ colors: false })({ key: [[]] } as never))
      .toThrow('Pretty formatter can only be used with original output');
  });

  it('should throw for data with non-string inner elements', () => {
    expect(() => DefaultFormatters.Pretty({ colors: false })({ key: [[123]] } as never))
      .toThrow('Pretty formatter can only be used with original output');
  });

  it('should handle self-referencing cycle', () => {
    const data = {
      'src/self.ts': [['src/self.ts']],
    } satisfies CircularDependenciesData;

    const result = DefaultFormatters.Pretty({ colors: false })(data);

    expect(result).toContain('src/self.ts');
    expect(result.split('\n')).toHaveLength(2);
  });

  describe('colors', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('should not include ANSI escape codes when colors disabled', () => {
      const data = {
        'src/a.ts': [['src/a.ts', 'src/b.ts']],
      } satisfies CircularDependenciesData;

      const result = DefaultFormatters.Pretty({ colors: false })(data);

      // eslint-disable-next-line no-control-regex
      expect(result).not.toMatch(/\u001B/);
    });

    it('should use colors by default when color env vars are not set', () => {
      vi.stubEnv('NO_COLOR', '');
      vi.stubEnv('FORCE_COLOR', '');
      vi.stubEnv('NODE_DISABLE_COLORS', '');

      const data = {
        'src/a.ts': [['src/a.ts', 'src/b.ts']],
      } satisfies CircularDependenciesData;

      const result = DefaultFormatters.Pretty()(data);

      // eslint-disable-next-line no-control-regex
      expect(result).toMatch(/\u001B/);
    });

    it('should disable colors when FORCE_COLOR is false', () => {
      vi.stubEnv('NO_COLOR', '');
      vi.stubEnv('FORCE_COLOR', 'false');
      vi.stubEnv('NODE_DISABLE_COLORS', '');

      const data = {
        'src/a.ts': [['src/a.ts', 'src/b.ts']],
      } satisfies CircularDependenciesData;

      const result = DefaultFormatters.Pretty()(data);

      // eslint-disable-next-line no-control-regex
      expect(result).not.toMatch(/\u001B/);
    });

    it('should disable colors when NO_COLOR is true', () => {
      vi.stubEnv('NO_COLOR', 'true');
      vi.stubEnv('FORCE_COLOR', '');
      vi.stubEnv('NODE_DISABLE_COLORS', '');

      const data = {
        'src/a.ts': [['src/a.ts', 'src/b.ts']],
      } satisfies CircularDependenciesData;

      const result = DefaultFormatters.Pretty()(data);

      // eslint-disable-next-line no-control-regex
      expect(result).not.toMatch(/\u001B/);
    });

    it('should disable colors when NODE_DISABLE_COLORS is 1', () => {
      vi.stubEnv('NO_COLOR', '');
      vi.stubEnv('FORCE_COLOR', '');
      vi.stubEnv('NODE_DISABLE_COLORS', '1');

      const data = {
        'src/a.ts': [['src/a.ts', 'src/b.ts']],
      } satisfies CircularDependenciesData;

      const result = DefaultFormatters.Pretty()(data);

      // eslint-disable-next-line no-control-regex
      expect(result).not.toMatch(/\u001B/);
    });

    it('should disable colors when NODE_DISABLE_COLORS is true', () => {
      vi.stubEnv('NO_COLOR', '');
      vi.stubEnv('FORCE_COLOR', '');
      vi.stubEnv('NODE_DISABLE_COLORS', 'true');

      const data = {
        'src/a.ts': [['src/a.ts', 'src/b.ts']],
      } satisfies CircularDependenciesData;

      const result = DefaultFormatters.Pretty()(data);

      // eslint-disable-next-line no-control-regex
      expect(result).not.toMatch(/\u001B/);
    });

    it('should disable colors when FORCE_COLOR is 0', () => {
      vi.stubEnv('NO_COLOR', '');
      vi.stubEnv('FORCE_COLOR', '0');
      vi.stubEnv('NODE_DISABLE_COLORS', '');

      const data = {
        'src/a.ts': [['src/a.ts', 'src/b.ts']],
      } satisfies CircularDependenciesData;

      const result = DefaultFormatters.Pretty()(data);

      // eslint-disable-next-line no-control-regex
      expect(result).not.toMatch(/\u001B/);
    });
  });
});
