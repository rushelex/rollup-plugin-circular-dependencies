import type { Context } from '../context';
import type { FormattedData } from '../types';

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { inspect } from 'node:util';

interface PrinterConstructorParams {
  readonly context: Context;
}

/** Serializes formatted data to a string */
function serialize(data: FormattedData, colors: boolean): string {
  if (data === null || data === undefined) {
    return '';
  }

  if (typeof data === 'string') {
    return data;
  }

  return inspect(data, { depth: null, colors });
}

abstract class Printer {
  protected readonly ctx: Context;

  public constructor(params: PrinterConstructorParams) {
    this.ctx = params.context;
  }

  public abstract shouldPrint(data: FormattedData): boolean;

  public abstract print(data: FormattedData): void;
}

class FilePrinter extends Printer {
  public shouldPrint(): boolean {
    return Boolean(this.ctx.options.outputFilePath);
  }

  public print(data: FormattedData): void {
    const resultData = serialize(data, false);
    const filePath = this.ctx.options.outputFilePath;
    const dirPath = dirname(filePath);

    try {
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
      }

      writeFileSync(filePath, resultData, { encoding: 'utf-8' });
    }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      throw new Error(`[circular-dependencies] Failed to write output file "${filePath}": ${message}`);
    }
  }
}

class ConsolePrinter extends Printer {
  public shouldPrint(data: FormattedData): boolean {
    const isConsolePrinter = !this.ctx.options.outputFilePath;
    const isDataExists = typeof data === 'string'
      ? data.length > 0
      : data !== null && data !== undefined;

    return isConsolePrinter && isDataExists;
  }

  public print(data: FormattedData): void {
    const output = serialize(data, true);

    if (!output) {
      return;
    }

    // eslint-disable-next-line no-console
    console.info(`\n\n${output}\n`);
  }
}

export function createPrinters(params: PrinterConstructorParams): Printer[] {
  return [new FilePrinter(params), new ConsolePrinter(params)];
}
