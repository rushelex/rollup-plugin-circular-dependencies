import { buildWithRollup } from './utils.ts';

const CIRCULAR_DEPS_ERROR = 'Circular dependencies detected';

describe('Plugin', () => {
  it('should print basic output in console', async () => {
    const { stdout, warnings } = await buildWithRollup(
      import('./fixtures/configs/rollup.output.console.basic.ts'),
    );

    expect(stdout).toMatchSnapshot();

    expect(warnings).toEqual(expect.arrayContaining([expect.stringContaining(CIRCULAR_DEPS_ERROR)]));
  });

  it('should print json output in console', async () => {
    const { stdout, warnings } = await buildWithRollup(
      import('./fixtures/configs/rollup.output.console.json.ts'),
    );

    expect(stdout).toMatchSnapshot();

    expect(warnings).toEqual(expect.arrayContaining([expect.stringContaining(CIRCULAR_DEPS_ERROR)]));
  });

  it('should print basic output in file', async () => {
    const { warnings, output } = await buildWithRollup(
      import('./fixtures/configs/rollup.output.file.basic.ts'),
    );

    expect(output).toMatchSnapshot();

    expect(warnings).toEqual(expect.arrayContaining([expect.stringContaining(CIRCULAR_DEPS_ERROR)]));
  });

  it('should print pretty output in file', async () => {
    const { warnings, output } = await buildWithRollup(
      import('./fixtures/configs/rollup.output.file.pretty.ts'),
    );

    expect(output).toMatchSnapshot();

    expect(warnings).toEqual(expect.arrayContaining([expect.stringContaining(CIRCULAR_DEPS_ERROR)]));
  });

  it('should skip detecting', async () => {
    const { stdout, warnings, hasError } = await buildWithRollup(
      import('./fixtures/configs/rollup.disabled.ts'),
    );

    expect(stdout).toMatchSnapshot();

    expect(warnings).not.toEqual(expect.arrayContaining([expect.stringContaining(CIRCULAR_DEPS_ERROR)]));

    expect(hasError).toBe(false);
  });

  it('should exit with code 0', async () => {
    const { hasError } = await buildWithRollup(
      import('./fixtures/configs/rollup.status.warn.ts'),
    );

    expect(hasError).toBe(false);
  });

  it('should exit with code 1', async () => {
    const { hasError } = await buildWithRollup(
      import('./fixtures/configs/rollup.status.error.ts'),
    );

    expect(hasError).toBe(true);
  });

  it('should call lifecycle callbacks', async () => {
    const { stdout } = await buildWithRollup(
      import('./fixtures/configs/rollup.callbacks.ts'),
    );

    expect(stdout).toMatchSnapshot();
  });
});
