import type { CircularDependenciesData } from '../../types';

import { existsSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { Context } from '../../context/context';
import { createPrinters } from '../printers';

describe(createPrinters, () => {
  it('should return two printers', () => {
    const ctx = new Context({});

    const printers = createPrinters({ context: ctx });

    expect(printers).toHaveLength(2);
  });
});

describe('FilePrinter', () => {
  const tmpDir = path.join(os.tmpdir(), 'circular-deps-test');
  const tmpFile = path.join(tmpDir, 'output.json');

  afterEach(() => {
    if (existsSync(tmpDir)) {
      rmSync(tmpDir, { recursive: true });
    }
  });

  it('should not print when outputFilePath is empty', () => {
    const ctx = new Context({});
    const [filePrinter] = createPrinters({ context: ctx });

    expect(filePrinter.shouldPrint('data')).toBe(false);
  });

  it('should print when outputFilePath is set', () => {
    const ctx = new Context({ outputFilePath: tmpFile });
    const [filePrinter] = createPrinters({ context: ctx });

    expect(filePrinter.shouldPrint('data')).toBe(true);
  });

  it('should write string data to file', () => {
    const ctx = new Context({ outputFilePath: tmpFile });
    const [filePrinter] = createPrinters({ context: ctx });

    filePrinter.print('test output content');

    const written = readFileSync(tmpFile, 'utf-8');
    expect(written).toBe('test output content');
  });

  it('should create directories recursively', () => {
    const nestedFile = path.join(tmpDir, 'nested', 'deep', 'output.json');
    const ctx = new Context({ outputFilePath: nestedFile });
    const [filePrinter] = createPrinters({ context: ctx });

    filePrinter.print('nested content');

    expect(existsSync(nestedFile)).toBe(true);
  });

  it('should skip mkdir when directory already exists', () => {
    const ctx = new Context({ outputFilePath: tmpFile });
    const [filePrinter] = createPrinters({ context: ctx });

    filePrinter.print('first');
    filePrinter.print('second');

    const written = readFileSync(tmpFile, 'utf-8');
    expect(written).toBe('second');
  });

  it('should serialize object data without colors', () => {
    const ctx = new Context({ outputFilePath: tmpFile });
    const [filePrinter] = createPrinters({ context: ctx });
    const data = {
      'src/a.ts': [['src/a.ts', 'src/b.ts']],
    } satisfies CircularDependenciesData;

    filePrinter.print(data);

    const written = readFileSync(tmpFile, 'utf-8');
    expect(written).toContain('src/a.ts');
    expect(written).toContain('src/b.ts');
    // eslint-disable-next-line no-control-regex
    expect(written).not.toMatch(/\u001B/);
  });

  it('should write empty string for null data', () => {
    const ctx = new Context({ outputFilePath: tmpFile });
    const [filePrinter] = createPrinters({ context: ctx });

    filePrinter.print(null);

    const written = readFileSync(tmpFile, 'utf-8');
    expect(written).toBe('');
  });

  it('should write empty string for undefined data', () => {
    const ctx = new Context({ outputFilePath: tmpFile });
    const [filePrinter] = createPrinters({ context: ctx });

    filePrinter.print(undefined);

    const written = readFileSync(tmpFile, 'utf-8');
    expect(written).toBe('');
  });

  it('should throw wrapped error when write fails', () => {
    const invalidPath = path.join('/dev/null/impossible/path', 'output.json');
    const ctx = new Context({ outputFilePath: invalidPath });
    const [filePrinter] = createPrinters({ context: ctx });

    expect(() => filePrinter.print('data'))
      .toThrow('[circular-dependencies] Failed to write output file');
  });

  it('should stringify non-Error thrown values', async () => {
    const ctx = new Context({ outputFilePath: tmpFile });
    const [filePrinter] = createPrinters({ context: ctx });

    vi.mock(import('node:fs'), { spy: true });
    const writeSpy = vi.spyOn(await import('node:fs'), 'writeFileSync')
      // eslint-disable-next-line no-throw-literal
      .mockImplementation(() => { throw 'disk full'; });

    expect(() => filePrinter.print('data'))
      .toThrow('disk full');

    writeSpy.mockRestore();
    vi.resetAllMocks();
  });
});

describe('ConsolePrinter', () => {
  it('should not print when outputFilePath is set', () => {
    const ctx = new Context({ outputFilePath: '/tmp/test-output.json' });
    const [, consolePrinter] = createPrinters({ context: ctx });

    expect(consolePrinter.shouldPrint('data')).toBe(false);
  });

  it('should print when outputFilePath is empty and data is non-empty string', () => {
    const ctx = new Context({});
    const [, consolePrinter] = createPrinters({ context: ctx });

    expect(consolePrinter.shouldPrint('some output')).toBe(true);
  });

  it('should not print when data is empty string', () => {
    const ctx = new Context({});
    const [, consolePrinter] = createPrinters({ context: ctx });

    expect(consolePrinter.shouldPrint('')).toBe(false);
  });

  it('should not print when data is null', () => {
    const ctx = new Context({});
    const [, consolePrinter] = createPrinters({ context: ctx });

    expect(consolePrinter.shouldPrint(null)).toBe(false);
  });

  it('should not print when data is undefined', () => {
    const ctx = new Context({});
    const [, consolePrinter] = createPrinters({ context: ctx });

    expect(consolePrinter.shouldPrint(undefined)).toBe(false);
  });

  it('should print when data is object', () => {
    const ctx = new Context({});
    const [, consolePrinter] = createPrinters({ context: ctx });
    const data = { 'a.ts': [['a.ts', 'b.ts']] } satisfies CircularDependenciesData;

    expect(consolePrinter.shouldPrint(data)).toBe(true);
  });

  it('should call console.info with formatted output', () => {
    const ctx = new Context({});
    const [, consolePrinter] = createPrinters({ context: ctx });
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    consolePrinter.print('cycle output');

    expect(infoSpy).toHaveBeenCalledOnce();
    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining('cycle output'));
    infoSpy.mockRestore();
  });

  it('should not call console.info when serialized output is empty', () => {
    const ctx = new Context({});
    const [, consolePrinter] = createPrinters({ context: ctx });
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    consolePrinter.print(null);

    expect(infoSpy).not.toHaveBeenCalled();
    infoSpy.mockRestore();
  });
});
