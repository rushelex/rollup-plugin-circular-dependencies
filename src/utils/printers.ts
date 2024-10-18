import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import type { Context } from '../context';

type FormattedData = any;

interface PrinterConstructorParams {
  context: Context;
}

abstract class Printer {
  protected ctx: Context;

  public constructor(params: PrinterConstructorParams) {
    this.ctx = params.context;
  }

  public shouldPrint(_data: FormattedData): boolean {
    return true;
  }

  public abstract print(data: FormattedData): void;
}

class FilePrinter extends Printer {
  public shouldPrint(): boolean {
    return Boolean(this.ctx.options.outputFilePath);
  }

  public print(data: FormattedData): void {
    const resultData = data ? String(data) : '';
    const dirPath = dirname(this.ctx.options.outputFilePath);

    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }

    writeFileSync(this.ctx.options.outputFilePath, resultData, {
      encoding: 'utf-8',
    });
  }
}

class ConsolePrinter extends Printer {
  public shouldPrint(data: FormattedData): boolean {
    const isConsolePrinter = !this.ctx.options.outputFilePath;
    const isDataExists = !!data || data === 0 || (typeof data === 'string' && data.length > 0);

    return isConsolePrinter && isDataExists;
  }

  public print(data: FormattedData): void {
    // eslint-disable-next-line no-console
    console.info(`\n\n${String(data)}\n`);
  }
}

export function createPrinters(params: PrinterConstructorParams): Printer[] {
  const printers = [FilePrinter, ConsolePrinter];
  return printers.map((PrinterConstructor) => new PrinterConstructor(params));
}
