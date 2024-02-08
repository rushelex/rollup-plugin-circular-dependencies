import { spawnSync } from 'node:child_process';
import { join, relative } from 'node:path';

export const OUTPUT_FILE_RELATIVE_PATH = './src/fixtures/output/circularDependencies';

export function getRollupProcess(rollupConfigPart: string) {
  const dir = __dirname;
  const rollupConfigFullName = `rollup.${rollupConfigPart}.ts`;
  const rollupConfigAbsolutePath = join(dir, 'fixtures', 'configs', rollupConfigFullName);
  const rollupConfigRelativePath = relative(process.cwd(), rollupConfigAbsolutePath);

  return spawnSync('rollup', ['--config', rollupConfigRelativePath, '--configPlugin', 'rollup-plugin-esbuild']);
}
