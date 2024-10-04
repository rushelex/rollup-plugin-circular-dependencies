import chalk from 'chalk';

import { type CircularDependenciesData } from '../types';

import { isNil, isObject, isString } from './primitive';

type Formatter = (data: CircularDependenciesData) => string;

interface PrettyFormatterConfig {
  colors?: boolean;
}

function JSONFormatter(): Formatter {
  return (data): string => {
    if (!Array.isArray(data) && !isObject(data)) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      return data ?? '';
    }

    return JSON.stringify(data, null, 2);
  };
}

function PrettyFormatter(config?: PrettyFormatterConfig): Formatter {
  const { colors = true } = config || {};

  return (data): string => {
    if (!isNil(data) && isObject(data) && Object.keys(data).length === 0) {
      return '';
    }

    if (!isValidData(data)) {
      throw new Error('Pretty formatter can only be used with original output');
    }

    const groups = [];

    for (const item of Object.entries(data)) {
      const [entryModuleId, moduleNodes] = item;

      let group = '';

      group += colors ? chalk.yellow(entryModuleId) : entryModuleId;

      for (const currentCir of moduleNodes) {
        group += '\n' + '    ' + currentCir.join(colors ? chalk.blue(' -> ') : ' -> ');
      }

      groups.push(group);
    }

    return groups.join('\n\n');
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isValidData(data: any): data is CircularDependenciesData {
  if (data && isObject(data)) {
    const [firstValue] = Object.values(data);

    if (Array.isArray(firstValue)) {
      const [firstChildValue] = firstValue;

      if (Array.isArray(firstChildValue) && firstChildValue.every(isString)) {
        return true;
      }
    }
  }

  return false;
}

export const DefaultFormatters = {
  JSON: JSONFormatter,
  Pretty: PrettyFormatter,
};
