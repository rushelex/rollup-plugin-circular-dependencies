import type { ModuleInfo } from '../types';

import { ModuleNode } from '../ModuleNode';

describe(ModuleNode, () => {
  describe('constructor', () => {
    it('should set id from module info', () => {
      const moduleInfo = createModuleInfo({ id: '/src/utils/helpers.ts' });

      const node = new ModuleNode(moduleInfo);

      expect(node.id).toBe('/src/utils/helpers.ts');
    });

    it('should merge static and dynamic imports into importedIds', () => {
      const moduleInfo = createModuleInfo({
        id: '/src/index.ts',
        importedIds: ['/src/utils.ts', '/src/types.ts'],
        dynamicallyImportedIds: ['/src/lazy.ts'],
      });

      const node = new ModuleNode(moduleInfo);

      expect(node.importedIds).toEqual(['/src/utils.ts', '/src/types.ts', '/src/lazy.ts']);
    });

    it('should handle empty imported and dynamic ids', () => {
      const moduleInfo = createModuleInfo({ id: '/src/empty.ts' });

      const node = new ModuleNode(moduleInfo);

      expect(node.importedIds).toEqual([]);
    });

    it('should initialize children as empty set', () => {
      const moduleInfo = createModuleInfo({ id: '/src/app.ts' });

      const node = new ModuleNode(moduleInfo);

      expect(node.children.size).toBe(0);
    });
  });

  describe('readonly properties', () => {
    it('should not allow reassignment of importedIds elements', () => {
      const moduleInfo = createModuleInfo({
        id: '/src/app.ts',
        importedIds: ['/src/original.ts'],
      });

      const node = new ModuleNode(moduleInfo);

      expect(() => {
        (node.importedIds as string[])[0] = '/src/modified.ts';
      }).toThrow();
    });
  });

  describe('children', () => {
    it('should allow adding child nodes', () => {
      const parent = new ModuleNode(createModuleInfo({ id: '/src/parent.ts' }));
      const child = new ModuleNode(createModuleInfo({ id: '/src/child.ts' }));

      parent.children.add(child);

      expect(parent.children.has(child)).toBe(true);
      expect(parent.children.size).toBe(1);
    });

    it('should prevent duplicate children via Set semantics', () => {
      const parent = new ModuleNode(createModuleInfo({ id: '/src/parent.ts' }));
      const child = new ModuleNode(createModuleInfo({ id: '/src/child.ts' }));

      parent.children.add(child);
      parent.children.add(child);

      expect(parent.children.size).toBe(1);
    });
  });
});

// Helpers

function createModuleInfo(partial: Partial<ModuleInfo> & { id: string }): ModuleInfo {
  return {
    importedIds: [],
    dynamicallyImportedIds: [],
    ...partial,
  };
}
