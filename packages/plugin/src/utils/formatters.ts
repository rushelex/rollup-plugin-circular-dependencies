import type { CircularDependenciesData } from '../types';

import process from 'node:process';
import { styleText } from 'node:util';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Formatter function that transforms circular dependencies data into a string */
type Formatter = (data: CircularDependenciesData) => string;

interface PrettyFormatterConfig {
  colors?: boolean;
}

/**
 * Creates a JSON formatter that serializes data with 2-space indentation.
 *
 * @returns Formatter function producing JSON string output
 *
 * @example
 * ```ts
 * circularDependencies({
 *   formatOut: DefaultFormatters.JSON()
 * })
 * ```
 */
function JSONFormatter(): Formatter {
  return (data): string => {
    if (!Array.isArray(data) && !isObject(data)) {
      return data ?? '';
    }

    return JSON.stringify(data, null, 2);
  };
}

function isColorDisabled(): boolean {
  return process.env.NO_COLOR === '1'
    || process.env.NO_COLOR === 'true'
    || process.env.NO_COLOR === 'TRUE'
    || process.env.NODE_DISABLE_COLORS === '1'
    || process.env.NODE_DISABLE_COLORS === 'true'
    || process.env.NODE_DISABLE_COLORS === 'TRUE'
    || process.env.FORCE_COLOR === '0'
    || process.env.FORCE_COLOR === 'false'
    || process.env.FORCE_COLOR === 'FALSE';
}

/**
 * Creates a human-readable pretty formatter with optional color support.
 * Colors are enabled by default unless disabled via environment variables
 * (`NO_COLOR`, `NODE_DISABLE_COLORS`, `FORCE_COLOR=0`).
 *
 * @param config - Optional configuration for color output
 * @returns Formatter function producing styled string output
 *
 * @example
 * ```ts
 * circularDependencies({
 *   formatOut: DefaultFormatters.Pretty({ colors: false })
 * })
 * ```
 */
function PrettyFormatter(config?: PrettyFormatterConfig): Formatter {
  const { colors = !isColorDisabled() } = config || {};

  return (data): string => {
    if (isObject(data) && Object.keys(data).length === 0) {
      return '';
    }

    if (!isValidData(data)) {
      throw new Error('Pretty formatter can only be used with original output');
    }

    const groups = [];

    for (const [entryModuleId, moduleNodes] of Object.entries(data)) {
      let group = '';

      group += colors ? styleText('yellow', entryModuleId) : entryModuleId;

      for (const currentCir of moduleNodes) {
        group += `\n` + `    ${currentCir.join(colors ? styleText('blue', ' -> ') : ' -> ')}`;
      }

      groups.push(group);
    }

    return groups.join('\n\n');
  };
}

/**
 * Validates that data conforms to CircularDependenciesData structure.
 * Checks all entries, not just the first one, for thorough validation.
 */
function isValidData(data: unknown): data is CircularDependenciesData {
  if (!data || !isObject(data)) {
    return false;
  }

  const values = Object.values(data);

  return values.every((value) => {
    if (!Array.isArray(value)) {
      return false;
    }

    return value.every((innerValue) => {
      return Array.isArray(innerValue)
        && innerValue.length > 0
        && innerValue.every((item) => typeof item === 'string');
    });
  });
}

export const DefaultFormatters = {
  JSON: JSONFormatter,
  Pretty: PrettyFormatter,
};
