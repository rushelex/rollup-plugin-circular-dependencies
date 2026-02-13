import type { PluginContext } from 'rollup';

import type { Options } from '../../types';

import { Context } from '../../context/context';
import { ModuleNode } from '../../module/ModuleNode';
import { printCycleNodes } from '../print';

describe(printCycleNodes, () => {
  describe('when no cycles detected', () => {
    it('should not call pluginContext.error or warn', () => {
      const { ctx, pluginCtx } = createTestContext();
      const emptyCycles = new Map<string, ModuleNode[]>();

      printCycleNodes(ctx, emptyCycles, pluginCtx, performance.now());

      expect(pluginCtx.error).not.toHaveBeenCalled();
      expect(pluginCtx.warn).not.toHaveBeenCalled();
    });

    it('should call onEnd with empty rawOutput', () => {
      const onEnd = vi.fn<NonNullable<Options['onEnd']>>();
      const { ctx, pluginCtx } = createTestContext({ onEnd });
      const emptyCycles = new Map<string, ModuleNode[]>();

      printCycleNodes(ctx, emptyCycles, pluginCtx, performance.now());

      expect(onEnd).toHaveBeenCalledOnce();
      const args = onEnd.mock.calls[0][0];
      expect(args.rawOutput).toEqual({});
    });

    it('should report zero cycles in metrics', () => {
      const onEnd = vi.fn<NonNullable<Options['onEnd']>>();
      const { ctx, pluginCtx } = createTestContext({ onEnd });
      const emptyCycles = new Map<string, ModuleNode[]>();

      printCycleNodes(ctx, emptyCycles, pluginCtx, performance.now());

      const { metrics } = onEnd.mock.calls[0][0];
      expect(metrics.cyclesFound).toBe(0);
      expect(metrics.largestCycleSize).toBe(0);
    });
  });

  describe('when cycles detected', () => {
    it('should call pluginContext.error when throwOnError is true', () => {
      const { ctx, pluginCtx } = createTestContext({ throwOnError: true });
      const cycles = createCycleMap([['a.ts', 'b.ts']]);

      printCycleNodes(ctx, cycles, pluginCtx, performance.now());

      expect(pluginCtx.error).toHaveBeenCalledOnce();
      expect(pluginCtx.error).toHaveBeenCalledWith(
        expect.stringContaining('Circular dependencies detected'),
      );
    });

    it('should call pluginContext.warn when throwOnError is false', () => {
      const { ctx, pluginCtx } = createTestContext({ throwOnError: false });
      const cycles = createCycleMap([['a.ts', 'b.ts']]);

      printCycleNodes(ctx, cycles, pluginCtx, performance.now());

      expect(pluginCtx.warn).toHaveBeenCalledOnce();
      expect(pluginCtx.warn).toHaveBeenCalledWith(
        expect.stringContaining('Circular dependencies detected'),
      );
    });

    it('should include cycle count in error message', () => {
      const { ctx, pluginCtx } = createTestContext({ throwOnError: true });
      const cycles = createCycleMap([['a.ts', 'b.ts'], ['c.ts', 'd.ts']]);

      printCycleNodes(ctx, cycles, pluginCtx, performance.now());

      expect(pluginCtx.error).toHaveBeenCalledWith(
        expect.stringContaining('2 cycle(s) found'),
      );
    });
  });

  describe('onEnd callback', () => {
    it('should provide rawOutput grouped by first node', () => {
      const onEnd = vi.fn<NonNullable<Options['onEnd']>>();
      const { ctx, pluginCtx } = createTestContext({ onEnd });
      const cycles = createCycleMap([['a.ts', 'b.ts']]);

      printCycleNodes(ctx, cycles, pluginCtx, performance.now());

      const { rawOutput } = onEnd.mock.calls[0][0];
      expect(rawOutput).toHaveProperty('a.ts');
      expect(rawOutput['a.ts']).toEqual([['a.ts', 'b.ts']]);
    });

    it('should provide metrics with correct values', () => {
      const onEnd = vi.fn<NonNullable<Options['onEnd']>>();
      const { ctx, pluginCtx } = createTestContext({ onEnd });
      ctx.moduleNodes.set('a.ts', createNode('a.ts'));
      ctx.moduleNodes.set('b.ts', createNode('b.ts'));
      ctx.moduleNodes.set('c.ts', createNode('c.ts'));
      const cycles = createCycleMap([['a.ts', 'b.ts', 'c.ts']]);

      printCycleNodes(ctx, cycles, pluginCtx, performance.now());

      const { metrics } = onEnd.mock.calls[0][0];
      expect(metrics.modulesChecked).toBe(3);
      expect(metrics.cyclesFound).toBe(1);
      expect(metrics.largestCycleSize).toBe(3);
      expect(metrics.detectionTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should pass pluginContext to onEnd', () => {
      const onEnd = vi.fn<NonNullable<Options['onEnd']>>();
      const { ctx, pluginCtx } = createTestContext({ onEnd });

      printCycleNodes(ctx, new Map(), pluginCtx, performance.now());

      expect(onEnd.mock.calls[0][1]).toBe(pluginCtx);
    });
  });

  describe('formatOutModulePath', () => {
    it('should not transform rawOutput paths', () => {
      const onEnd = vi.fn<NonNullable<Options['onEnd']>>();
      const formatOutModulePath = (p: string) => p.replace('/abs/', '');
      const { ctx, pluginCtx } = createTestContext({ onEnd, formatOutModulePath });
      const cycles = createCycleMap([['/abs/a.ts', '/abs/b.ts']]);

      printCycleNodes(ctx, cycles, pluginCtx, performance.now());

      const { rawOutput } = onEnd.mock.calls[0][0];
      expect(rawOutput).toHaveProperty('/abs/a.ts');
    });

    it('should transform paths in formattedOutput', () => {
      const onEnd = vi.fn<NonNullable<Options['onEnd']>>();
      const formatOutModulePath = (p: string) => p.replace('/abs/', '');
      const { ctx, pluginCtx } = createTestContext({ onEnd, formatOutModulePath });
      const cycles = createCycleMap([['/abs/a.ts', '/abs/b.ts']]);

      printCycleNodes(ctx, cycles, pluginCtx, performance.now());

      const { formattedOutput } = onEnd.mock.calls[0][0];
      expect(String(formattedOutput)).toContain('a.ts');
    });
  });

  describe('ignoreCycle', () => {
    it('should filter out ignored cycles', () => {
      const onEnd = vi.fn<NonNullable<Options['onEnd']>>();
      const ignoreCycle = (paths: string[]) => paths.includes('ignored.ts');
      const { ctx, pluginCtx } = createTestContext({ onEnd, ignoreCycle });
      const cycles = createCycleMap([
        ['a.ts', 'ignored.ts'],
        ['b.ts', 'c.ts'],
      ]);

      printCycleNodes(ctx, cycles, pluginCtx, performance.now());

      const { rawOutput } = onEnd.mock.calls[0][0];
      expect(rawOutput).not.toHaveProperty('a.ts');
      expect(rawOutput).toHaveProperty('b.ts');
    });

    it('should not report error when all cycles are ignored', () => {
      const ignoreCycle = () => true;
      const { ctx, pluginCtx } = createTestContext({ ignoreCycle });
      const cycles = createCycleMap([['a.ts', 'b.ts']]);

      printCycleNodes(ctx, cycles, pluginCtx, performance.now());

      expect(pluginCtx.error).not.toHaveBeenCalled();
      expect(pluginCtx.warn).not.toHaveBeenCalled();
    });
  });

  describe('debug mode', () => {
    it('should call pluginContext.info when debug is true', () => {
      const { ctx, pluginCtx } = createTestContext({ debug: true });
      const cycles = createCycleMap([['a.ts', 'b.ts']]);

      printCycleNodes(ctx, cycles, pluginCtx, performance.now());

      expect(pluginCtx.info).toHaveBeenCalled();
    });

    it('should not call pluginContext.info when debug is false', () => {
      const { ctx, pluginCtx } = createTestContext({ debug: false });
      const cycles = createCycleMap([['a.ts', 'b.ts']]);

      printCycleNodes(ctx, cycles, pluginCtx, performance.now());

      expect(pluginCtx.info).not.toHaveBeenCalled();
    });
  });
});

// Helpers

function createNode(id: string): ModuleNode {
  return new ModuleNode({ id, importedIds: [], dynamicallyImportedIds: [] });
}

function createTestContext(optionsOverrides: Partial<Options> = {}) {
  const ctx = new Context(optionsOverrides);
  const pluginCtx = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } as unknown as PluginContext;

  return { ctx, pluginCtx };
}

function createCycleMap(cycles: string[][]): Map<string, ModuleNode[]> {
  const map = new Map<string, ModuleNode[]>();

  for (const cycle of cycles) {
    const nodes = cycle.map((id) => createNode(id));
    const key = cycle.sort().join('-');
    map.set(key, nodes);
  }

  return map;
}
