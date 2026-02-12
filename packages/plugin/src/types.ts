import type { FilterPattern } from '@rollup/pluginutils';
import type { LogHandlerWithDefault, PluginContext, Plugin as RollupPlugin } from 'rollup';

import type { ModuleInfo, ModuleNode } from './module';

export type CircularDependenciesData = Record<string, Array<Array<ModuleNode['id']>>>;

/** Formatted output data produced by formatters */
export type FormattedData = string | CircularDependenciesData | null | undefined;

/**
 * Metrics collected during circular dependency detection.
 * Provided in the `onEnd` callback for analysis and monitoring.
 */
export interface Metrics {
  /** Total number of modules checked for circular dependencies */
  readonly modulesChecked: number;
  /** Number of unique cycles found */
  readonly cyclesFound: number;
  /** Size of the largest cycle (number of modules) */
  readonly largestCycleSize: number;
  /** Time taken for detection in milliseconds */
  readonly detectionTimeMs: number;
}

interface OptionsOnEndArgs {
  rawOutput: CircularDependenciesData;
  formattedOutput: unknown;
  metrics: Metrics;
}

export interface Options {
  /**
   * Enable plugin
   *
   * @default true
   */
  enabled?: boolean;
  /**
   * Include specific files based on a RegExp or a glob pattern
   *
   * @default [/\.(c|m)?[jt]s(x)?$/]
   */
  include?: FilterPattern;
  /**
   * Exclude specific files based on a RegExp or a glob pattern
   *
   * @default [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/]
   */
  exclude?: FilterPattern;
  /**
   * Throw Vite error instead of warning
   *
   * @default true
   */
  throwOnError?: boolean;
  /**
   * Path to the file with scan results. By default, the result is output to the console
   *
   * @default ""
   */
  outputFilePath?: string;
  /**
   * Enable debug logging for troubleshooting
   *
   * @default false
   */
  debug?: boolean;
  /**
   * Formats the output module path
   *
   * _Default_: `""`
   *
   * @param {string} path - The module path to be formatted
   * @returns {string} - The formatted module path
   */
  formatOutModulePath?: (path: string) => string;
  /**
   * Formats the given data into a specific output format
   *
   * _Default (console)_: `DefaultFormatters.Pretty({ colors: true })`
   *
   * _Default (file)_: `DefaultFormatters.JSON()`
   *
   * @param {CircularDependenciesData} data - The input data to be formatted
   * @returns {unknown} - The formatted output
   */
  formatOut?: (data: CircularDependenciesData) => unknown;
  /**
   * Filter function to ignore specific circular dependency cycles.
   * Return `true` to ignore the cycle, `false` to report it.
   *
   * @param {string[]} cyclePaths - Array of module paths forming the cycle
   * @returns {boolean} - Whether to ignore this cycle
   *
   * @example
   * ```ts
   * ignoreCycle: (paths) => paths.some(p => p.includes('generated'))
   * ```
   */
  ignoreCycle?: (cyclePaths: string[]) => boolean;
  /**
   * Called before the cycle detection starts
   *
   * @returns {void}
   */
  onStart?: (pluginContext: PluginContext) => void;
  /**
   * Called for each cyclical module
   *
   * @returns {void}
   */
  onDetected?: (modulePath: ModuleNode['id'], pluginContext: PluginContext) => void;
  /**
   * Called after the cycle detection ends
   *
   * @returns {void}
   */
  onEnd?: (params: OptionsOnEndArgs, pluginContext: PluginContext) => void;
}

/**
 * Minimal subset of Rollup's `InputOptions` for cross-version compatibility.
 * Supports Rollup v2, v3, and v4.
 */
interface InputOptions {
  onLog?: LogHandlerWithDefault;
  onwarn?: (warning: { code?: string; message: string } | string, defaultHandler: (warning: string | { code?: string; message: string }) => void) => void;
}

/**
 * Plugin interface compatible with both Rollup v3 and v4.
 * Uses a minimal subset of hooks to ensure cross-version support.
 */
export type Plugin = Pick<RollupPlugin, 'name'> & {
  options: (inputOptions: InputOptions) => void;
  moduleParsed: (moduleInfo: ModuleInfo) => void;
  generateBundle: () => void;
};
