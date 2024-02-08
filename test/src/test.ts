import { existsSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

import { getRollupProcess, OUTPUT_FILE_RELATIVE_PATH } from './utils';

const CIRCULAR_DEPS_ERROR = 'Circular dependencies has been detected';

const testOutputFilePath = resolve(process.cwd(), OUTPUT_FILE_RELATIVE_PATH);

beforeEach(() => {
  if (existsSync(testOutputFilePath)) {
    rmSync(testOutputFilePath);
  }
});

test('should print basic output in console', () => {
  const { stdout, stderr } = getRollupProcess('output.console.basic');

  expect(stdout.toString()).toMatchSnapshot();

  expect(stderr.toString().includes(CIRCULAR_DEPS_ERROR)).toBeTruthy();
});

test('should print json output in console', () => {
  const { stdout, stderr } = getRollupProcess('output.console.json');

  expect(stdout.toString()).toMatchSnapshot();

  expect(stderr.toString().includes(CIRCULAR_DEPS_ERROR)).toBeTruthy();
});

test('should print basic output in file', () => {
  const { stderr } = getRollupProcess('output.file.basic');

  const outputContent = readFileSync(testOutputFilePath, { encoding: 'utf-8' });

  expect(outputContent).toMatchSnapshot();

  expect(stderr.toString().includes(CIRCULAR_DEPS_ERROR)).toBeTruthy();
});

test('should print pretty output in file', () => {
  const { stderr } = getRollupProcess('output.file.pretty');

  const outputContent = readFileSync(testOutputFilePath, { encoding: 'utf-8' });

  expect(outputContent).toMatchSnapshot();

  expect(stderr.toString().includes(CIRCULAR_DEPS_ERROR)).toBeTruthy();
});

test('should skip detecting', () => {
  const { stdout, stderr, status } = getRollupProcess('disabled');

  expect(stdout.toString()).toMatchSnapshot();

  expect(stderr.toString().includes(CIRCULAR_DEPS_ERROR)).toBeFalsy();

  expect(status).toBe(0);
});

test('should exit with code 0', () => {
  const { status } = getRollupProcess('status.warn');

  expect(status).toBe(0);
});

test('should exit with code 1', () => {
  const { status } = getRollupProcess('status.error');

  expect(status).toBe(1);
});

test('should call lifecycle callbacks', () => {
  const { stdout } = getRollupProcess('callbacks');

  expect(stdout.toString()).toMatchSnapshot();
});
