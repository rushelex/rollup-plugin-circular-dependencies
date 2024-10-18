/**
 * Duplicates part of Rollup's `ModuleInfo` interface for backwards compatibility
 */
export interface ModuleInfo {
  id: string;
  importedIds: string[] | readonly string[];
  dynamicallyImportedIds: string[] | readonly string[];
}
