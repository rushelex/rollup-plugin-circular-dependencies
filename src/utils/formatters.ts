import { isNil, isObject, isString } from 'lodash-es';
import { createColors } from 'picocolors';

import type { CircularDependenciesData } from '../types';

type Formatter = (data: CircularDependenciesData) => string;

interface PrettyFormatterConfig {
  colors?: boolean;
}

function JSONFormatter(): Formatter {
  return (data): string => {
    if (!Array.isArray(data) && !isObject(data)) {
      return String(data) ?? '';
    }

    return JSON.stringify(data, null, 2);
  };
}

function PrettyFormatter(config?: PrettyFormatterConfig): Formatter {
  const { colors = true } = config || {};

  const color = createColors(colors);

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

      group += color.yellow(entryModuleId);

      for (const currentCir of moduleNodes) {
        group += `\n` + `    ${currentCir.join(` ${color.blue('->')} `)}`;
      }

      groups.push(group);
    }

    return groups.join('\n\n');
  };
}

function isValidData(data: any): data is CircularDependenciesData {
  if (Boolean(data) && isObject(data)) {
    // eslint-disable-next-line ts/no-unsafe-assignment
    const [firstValue] = Object.values(data);

    if (Array.isArray(firstValue)) {
      // eslint-disable-next-line ts/no-unsafe-assignment
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
