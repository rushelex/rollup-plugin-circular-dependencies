import type { ModuleInfo } from './types';

export class ModuleNode {
  public readonly id: string;
  public readonly importedIds: readonly string[];
  public readonly children = new Set<ModuleNode>();

  constructor(moduleInfo: ModuleInfo) {
    this.id = moduleInfo.id;
    this.importedIds = Object.freeze([...moduleInfo.importedIds, ...moduleInfo.dynamicallyImportedIds]);
  }
}
