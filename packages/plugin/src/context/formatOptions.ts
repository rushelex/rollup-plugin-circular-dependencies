import type { FilterPattern } from '@rollup/pluginutils';

import type { CircularDependenciesData, Options } from '../types';

import path from 'node:path';
import process from 'node:process';

import { DEFAULT_EXCLUDE, DEFAULT_INCLUDE } from '../constants';
import { DefaultFormatters } from '../utils';

/**
 * Normalizes and validates user-provided options into a complete configuration.
 * Applies default values for all optional fields.
 *
 * @param options - Partial options provided by the user
 * @returns Fully resolved options with all defaults applied
 * @throws {Error} When option values are invalid
 */
export function formatOptions(options: Options): Required<Options> {
  validateOptions(options);

  const {
    enabled = true,
    include = DEFAULT_INCLUDE,
    throwOnError = true,
    debug = false,
    formatOutModulePath,
    formatOut,
    ignoreCycle,
    onStart,
    onDetected,
    onEnd,
  } = options;

  let { outputFilePath = '' } = options;

  const exclude = options.exclude !== undefined
    ? normalizeExcludePattern(options.exclude)
    : DEFAULT_EXCLUDE;

  outputFilePath = normalizeOutputFilePath(outputFilePath);

  return {
    enabled,
    include,
    exclude,
    throwOnError,
    debug,
    outputFilePath,
    formatOutModulePath: formatOutModulePath ?? defaultFormatOutModulePath,
    formatOut: formatOut ?? getDefaultFormatOut(outputFilePath),
    ignoreCycle: ignoreCycle ?? (() => false),
    onStart: onStart ?? (() => undefined),
    onDetected: onDetected ?? (() => undefined),
    onEnd: onEnd ?? (() => undefined),
  };
}

function validateOptions(options: Options): void {
  if (options.outputFilePath !== undefined && typeof options.outputFilePath !== 'string') {
    throw new Error(`[circular-dependencies] "outputFilePath" must be a string`);
  }

  if (options.formatOutModulePath !== undefined && typeof options.formatOutModulePath !== 'function') {
    throw new Error(`[circular-dependencies] "formatOutModulePath" must be a function`);
  }

  if (options.formatOut !== undefined && typeof options.formatOut !== 'function') {
    throw new Error(`[circular-dependencies] "formatOut" must be a function`);
  }

  if (options.ignoreCycle !== undefined && typeof options.ignoreCycle !== 'function') {
    throw new Error(`[circular-dependencies] "ignoreCycle" must be a function`);
  }

  if (options.onStart !== undefined && typeof options.onStart !== 'function') {
    throw new Error(`[circular-dependencies] "onStart" must be a function`);
  }

  if (options.onDetected !== undefined && typeof options.onDetected !== 'function') {
    throw new Error(`[circular-dependencies] "onDetected" must be a function`);
  }

  if (options.onEnd !== undefined && typeof options.onEnd !== 'function') {
    throw new Error(`[circular-dependencies] "onEnd" must be a function`);
  }
}

function normalizeOutputFilePath(outputFilePath: string) {
  if (outputFilePath) {
    return path.isAbsolute(outputFilePath) ? outputFilePath : path.join(process.cwd(), outputFilePath);
  }

  return outputFilePath;
}

function normalizeExcludePattern(exclude: FilterPattern) {
  if (Array.isArray(exclude)) {
    return [...exclude, ...DEFAULT_EXCLUDE];
  }

  if (exclude) {
    return [exclude, ...DEFAULT_EXCLUDE];
  }

  return DEFAULT_EXCLUDE;
}

function defaultFormatOutModulePath(outputFilePath: string) {
  return path.relative(process.cwd(), outputFilePath);
}

function getDefaultFormatOut(outputFilePath: Options['outputFilePath']) {
  return (data: CircularDependenciesData) => {
    return outputFilePath ? DefaultFormatters.JSON()(data) : DefaultFormatters.Pretty()(data);
  };
}
