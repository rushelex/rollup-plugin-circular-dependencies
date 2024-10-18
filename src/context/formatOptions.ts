import { join, relative } from 'node:path';
import { cwd } from 'node:process';

import type { CircularDependenciesData, Options } from '../types';
import type { FilterPattern } from '../utils/createFilter';

import { DefaultFormatters } from '../utils/formatters';

const DEFAULT_EXCLUDE: RegExp[] = [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/];

export function formatOptions(options: Options): Required<Options> {
  const {
    enabled = true,
    include = [/\.[jt]sx?$/],
    throwOnError = true,
    formatOutModulePath = defaultFormatOutModulePath,
    formatOut,
    onStart = () => undefined,
    onDetected = () => undefined,
    onEnd = () => undefined,
  } = options;

  let { exclude = DEFAULT_EXCLUDE, outputFilePath = '' } = options;

  exclude = normalizeExcludePattern(exclude);

  outputFilePath = normalizeOutputFilePath(outputFilePath);

  return {
    enabled,
    include,
    exclude,
    throwOnError,
    outputFilePath,
    formatOutModulePath,
    formatOut: formatOut ?? getDefaultFormatOut(outputFilePath),
    onStart,
    onDetected,
    onEnd,
  };
}

function normalizeOutputFilePath(outputFilePath: string) {
  if (outputFilePath) {
    return join(cwd(), outputFilePath);
  }

  return outputFilePath;
}

function normalizeExcludePattern(exclude: FilterPattern) {
  if (Array.isArray(exclude)) {
    return [...(exclude as ReadonlyArray<string | RegExp>), ...DEFAULT_EXCLUDE];
  }

  if (exclude) {
    return [exclude as string | RegExp, ...DEFAULT_EXCLUDE];
  }

  return DEFAULT_EXCLUDE;
}

function defaultFormatOutModulePath(path: string) {
  return relative(cwd(), path);
}

function getDefaultFormatOut(outputFilePath: Options['outputFilePath']) {
  return (data: CircularDependenciesData) => {
    return typeof outputFilePath === 'string' && outputFilePath.trim() !== ''
      ? DefaultFormatters.JSON()(data)
      : DefaultFormatters.Pretty({ colors: true })(data);
  };
}
