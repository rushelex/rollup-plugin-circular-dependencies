import type { LogHandlerWithDefault, PluginContext } from 'rollup';

import type { ModuleInfo, ModuleNode } from './module';
import type { FilterPattern } from './utils/createFilter';

export type CircularDependenciesData = Record<string, Array<Array<ModuleNode['id']>>>;

interface OptionsOnEndArgs {
  rawOutput: CircularDependenciesData;
  formattedOutput: any;
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
   * @default [/\.[jt]sx?$/]
   */
  include?: FilterPattern;
  /**
   * Exclude specific files based on a RegExp or a glob pattern
   *
   * @default [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/]
   */
  exclude?: FilterPattern;
  /**
   * Throw Rollup error instead of warning
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
   * @returns {any} - The formatted output
   */
  formatOut?: (data: CircularDependenciesData) => any;
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
   * Called before the cycle detection ends
   *
   * @returns {void}
   */
  onEnd?: (params: OptionsOnEndArgs, pluginContext: PluginContext) => void;
}

/**
 * Duplicates Rollup's `InputOptions` interface for backwards compatibility
 */
interface InputOptions {
  onLog?: LogHandlerWithDefault;
}

/**
 * Duplicates Rollup's `Plugin` interface for backwards compatibility
 */
export interface Plugin {
  name: string;
  options: (inputOptions: InputOptions) => void;
  moduleParsed: (moduleInfo: ModuleInfo) => void;
  generateBundle: () => void;
}
