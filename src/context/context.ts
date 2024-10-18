import { createFilter } from '@rollup/pluginutils';

import type { ModuleNode } from '../module';
import type { Options } from '../types';

import { formatOptions } from './formatOptions';

export class Context {
  public options: Required<Options>;

  public shouldProcessModule: (moduleId: string) => boolean;

  private _moduleNode: ModuleNode | null = null;

  public moduleNodes: Map<string, ModuleNode>;

  constructor(options: Options) {
    this.options = formatOptions(options);

    this.shouldProcessModule = createFilter(this.options.include, this.options.exclude);

    this.moduleNodes = new Map<string, ModuleNode>();
  }

  get moduleNode() {
    return this._moduleNode;
  }

  set moduleNode(moduleNode) {
    if (!this._moduleNode) {
      this._moduleNode = moduleNode;
    }
  }
}
