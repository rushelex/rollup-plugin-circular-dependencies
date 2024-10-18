import { existsSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { cwd } from 'node:process';
import { expect } from 'vitest';

import { getRollupRunningProcess, OUTPUT_FILE_RELATIVE_PATH } from './utils';

const CIRCULAR_DEPS_ERROR = 'Circular dependencies has been detected';

const testOutputFilePath = resolve(cwd(), OUTPUT_FILE_RELATIVE_PATH);

describe('main test', () => {
  beforeEach(() => {
    if (existsSync(testOutputFilePath)) {
      rmSync(testOutputFilePath);
    }
  });

  it('should print basic output in console', () => {
    const { stdout, stderr } = getRollupRunningProcess('output.console.basic');

    expect(stdout.toString()).toMatchSnapshot();

    expect(stderr.toString().includes(CIRCULAR_DEPS_ERROR)).toBeTruthy();
  });

  it('should print json output in console', () => {
    const { stdout, stderr } = getRollupRunningProcess('output.console.json');

    expect(stdout.toString()).toMatchSnapshot();

    expect(stderr.toString().includes(CIRCULAR_DEPS_ERROR)).toBeTruthy();
  });

  it('should print basic output in file', () => {
    const { stderr } = getRollupRunningProcess('output.file.basic');

    const outputContent = readFileSync(testOutputFilePath, { encoding: 'utf-8' });

    expect(outputContent).toMatchSnapshot();

    expect(stderr.toString().includes(CIRCULAR_DEPS_ERROR)).toBeTruthy();
  });

  it('should print pretty colored output in file', () => {
    const { stderr } = getRollupRunningProcess('output.file.pretty.colored');

    const outputContent = readFileSync(testOutputFilePath, { encoding: 'utf-8' });

    expect(outputContent).toMatchSnapshot();

    expect(stderr.toString().includes(CIRCULAR_DEPS_ERROR)).toBeTruthy();
  });

  it('should print pretty uncolored output in file', () => {
    const { stderr } = getRollupRunningProcess('output.file.pretty.uncolored');

    const outputContent = readFileSync(testOutputFilePath, { encoding: 'utf-8' });

    expect(outputContent).toMatchSnapshot();

    expect(stderr.toString().includes(CIRCULAR_DEPS_ERROR)).toBeTruthy();
  });

  it('should skip detecting', () => {
    const { stdout, stderr, status } = getRollupRunningProcess('disabled');

    expect(stdout.toString()).toMatchSnapshot();

    expect(stderr.toString().includes(CIRCULAR_DEPS_ERROR)).toBeFalsy();

    expect(status).toBe(0);
  });

  it('should exit with code 0', () => {
    const { status } = getRollupRunningProcess('status.warn');

    expect(status).toBe(0);
  });

  it('should exit with code 1', () => {
    const { status } = getRollupRunningProcess('status.error');

    expect(status).toBe(1);
  });

  it('should call lifecycle callbacks', () => {
    const { stdout } = getRollupRunningProcess('callbacks');

    expect(stdout.toString()).toMatchSnapshot();
  });
});
