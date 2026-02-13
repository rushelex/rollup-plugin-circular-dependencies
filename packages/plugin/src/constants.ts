/** Plugin name used in Rollup plugin system */
export const PLUGIN_NAME = 'circular-dependencies';

/** Default file extensions to include in circular dependency checks */
export const DEFAULT_INCLUDE = [/\.(c|m)?[jt]s(x)?$/];

/** Default patterns to exclude from circular dependency checks */
export const DEFAULT_EXCLUDE: RegExp[] = [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/];

/** Rollup log code for built-in circular dependency warnings */
export const ROLLUP_CIRCULAR_DEPENDENCY_CODE = 'CIRCULAR_DEPENDENCY';
