import { spawnSync } from 'node:child_process';
import { join, relative } from 'node:path';
import { cwd } from 'node:process';

export const OUTPUT_FILE_RELATIVE_PATH = './src/fixtures/output/circularDependencies';

export function getRollupRunningProcess(rollupConfigPart: string) {
  const dir = __dirname;
  const rollupConfigFullName = `rollup.${rollupConfigPart}.ts`;
  const rollupConfigAbsolutePath = join(dir, 'fixtures', 'configs', rollupConfigFullName);
  const rollupConfigRelativePath = relative(cwd(), rollupConfigAbsolutePath);

  return spawnSync('rollup', ['--config', rollupConfigRelativePath, '--configPlugin', 'rollup-plugin-esbuild']);
}
