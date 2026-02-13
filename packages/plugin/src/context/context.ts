import type { ModuleNode } from '../module';

import type { Options } from '../types';

import { createFilter } from '@rollup/pluginutils';

import { formatOptions } from './formatOptions';

/**
 * Internal plugin state container.
 * Holds resolved options, module graph, and entry point reference.
 * Supports cleanup between builds for watch mode compatibility.
 */
export class Context {
  public readonly options: Required<Options>;
  public readonly shouldProcessModule: (moduleId: string) => boolean;
  public readonly moduleNodes: Map<string, ModuleNode>;
  private _entryModuleNode: ModuleNode | null = null;

  constructor(options: Options) {
    this.options = formatOptions(options);

    this.shouldProcessModule = createFilter(this.options.include, this.options.exclude);

    this.moduleNodes = new Map<string, ModuleNode>();
  }

  /** Returns the entry module node (first parsed module) */
  public get entryModuleNode(): ModuleNode | null {
    return this._entryModuleNode;
  }

  /** Sets the entry module node. Only the first assignment takes effect per build cycle. */
  public setEntryModuleNode(moduleNode: ModuleNode): void {
    if (!this._entryModuleNode) {
      this._entryModuleNode = moduleNode;
    }
  }

  /**
   * Resets internal state between build cycles.
   * Essential for watch mode to prevent stale data and memory leaks.
   */
  public reset(): void {
    this._entryModuleNode = null;
    this.moduleNodes.clear();
  }
}
