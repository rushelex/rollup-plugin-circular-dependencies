import type { ModuleInfo } from './types';

export class ModuleNode {
  public id: string;

  public importedIds: string[];

  public children = new Set<ModuleNode>();

  constructor(moduleInfo: ModuleInfo) {
    this.id = moduleInfo.id;
    this.importedIds = [...moduleInfo.importedIds, ...moduleInfo.dynamicallyImportedIds];
  }
}
