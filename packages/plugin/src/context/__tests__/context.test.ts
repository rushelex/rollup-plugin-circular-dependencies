import { ModuleNode } from '../../module/ModuleNode';
import { Context } from '../context';

describe(Context, () => {
  describe('constructor', () => {
    it('should resolve default options when none provided', () => {
      const ctx = new Context({});

      expect(ctx.options.enabled).toBe(true);
      expect(ctx.options.throwOnError).toBe(true);
      expect(ctx.options.debug).toBe(false);
      expect(ctx.options.outputFilePath).toBe('');
    });

    it('should apply user-provided options', () => {
      const ctx = new Context({
        enabled: false,
        throwOnError: false,
        debug: true,
      });

      expect(ctx.options.enabled).toBe(false);
      expect(ctx.options.throwOnError).toBe(false);
      expect(ctx.options.debug).toBe(true);
    });

    it('should initialize moduleNodes as empty map', () => {
      const ctx = new Context({});

      expect(ctx.moduleNodes.size).toBe(0);
    });

    it('should create shouldProcessModule filter', () => {
      const ctx = new Context({
        include: [/\.ts$/],
        exclude: [/node_modules/],
      });

      expect(ctx.shouldProcessModule('/src/index.ts')).toBe(true);
      expect(ctx.shouldProcessModule('/node_modules/lib/index.ts')).toBe(false);
      expect(ctx.shouldProcessModule('/src/styles.css')).toBe(false);
    });
  });

  describe('entryModuleNode', () => {
    it('should return null initially', () => {
      const ctx = new Context({});

      expect(ctx.entryModuleNode).toBeNull();
    });
  });

  describe('setEntryModuleNode', () => {
    it('should set the entry module node on first call', () => {
      const ctx = new Context({});
      const node = createNode('entry.ts');

      ctx.setEntryModuleNode(node);

      expect(ctx.entryModuleNode).toBe(node);
    });

    it('should ignore subsequent calls after first assignment', () => {
      const ctx = new Context({});
      const firstNode = createNode('first.ts');
      const secondNode = createNode('second.ts');

      ctx.setEntryModuleNode(firstNode);
      ctx.setEntryModuleNode(secondNode);

      expect(ctx.entryModuleNode).toBe(firstNode);
    });
  });

  describe('reset', () => {
    it('should clear entryModuleNode', () => {
      const ctx = new Context({});
      ctx.setEntryModuleNode(createNode('entry.ts'));

      ctx.reset();

      expect(ctx.entryModuleNode).toBeNull();
    });

    it('should clear moduleNodes map', () => {
      const ctx = new Context({});
      const node = createNode('module.ts');
      ctx.moduleNodes.set('module.ts', node);

      ctx.reset();

      expect(ctx.moduleNodes.size).toBe(0);
    });

    it('should allow setting entry module again after reset', () => {
      const ctx = new Context({});
      const firstNode = createNode('first.ts');
      const secondNode = createNode('second.ts');

      ctx.setEntryModuleNode(firstNode);
      ctx.reset();
      ctx.setEntryModuleNode(secondNode);

      expect(ctx.entryModuleNode).toBe(secondNode);
    });
  });
});

// Helpers

function createNode(id: string): ModuleNode {
  return new ModuleNode({ id, importedIds: [], dynamicallyImportedIds: [] });
}
