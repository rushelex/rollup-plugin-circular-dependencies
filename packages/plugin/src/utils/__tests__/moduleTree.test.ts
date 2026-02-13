import type { PluginContext } from 'rollup';

import type { ModuleInfo } from '../../module/types';

import { fc, it } from '@fast-check/vitest';

import { Context } from '../../context/context';
import { ModuleNode } from '../../module/ModuleNode';
import { generateCycleNodesMap, generateModuleTree } from '../moduleTree';

describe(generateModuleTree, () => {
  it('should resolve children from moduleNodes map', () => {
    const { ctx, nodes } = createLinearGraph(['a.ts', 'b.ts', 'c.ts']);

    generateModuleTree(ctx, nodes.get('a.ts')!);

    expect(nodes.get('a.ts')!.children.size).toBe(1);
    expect(nodes.get('a.ts')!.children.has(nodes.get('b.ts')!)).toBe(true);
    expect(nodes.get('b.ts')!.children.has(nodes.get('c.ts')!)).toBe(true);
    expect(nodes.get('c.ts')!.children.size).toBe(0);
  });

  it('should handle circular imports without infinite loop', () => {
    const { ctx, nodes } = createGraph({
      'a.ts': ['b.ts'],
      'b.ts': ['a.ts'],
    });

    generateModuleTree(ctx, nodes.get('a.ts')!);

    expect(nodes.get('a.ts')!.children.has(nodes.get('b.ts')!)).toBe(true);
    expect(nodes.get('b.ts')!.children.has(nodes.get('a.ts')!)).toBe(true);
  });

  it('should skip imported ids not present in moduleNodes', () => {
    const nodeA = createNodeWithImports('a.ts', ['b.ts', 'missing.ts']);
    const nodeB = createNodeWithImports('b.ts', []);
    const ctx = new Context({});
    ctx.moduleNodes.set('a.ts', nodeA);
    ctx.moduleNodes.set('b.ts', nodeB);

    generateModuleTree(ctx, nodeA);

    expect(nodeA.children.size).toBe(1);
    expect(nodeA.children.has(nodeB)).toBe(true);
  });

  it('should handle self-referencing module', () => {
    const { ctx, nodes } = createGraph({
      'self.ts': ['self.ts'],
    });

    generateModuleTree(ctx, nodes.get('self.ts')!);

    expect(nodes.get('self.ts')!.children.has(nodes.get('self.ts')!)).toBe(true);
  });

  it('should handle diamond dependency graph', () => {
    const { ctx, nodes } = createGraph({
      'a.ts': ['b.ts', 'c.ts'],
      'b.ts': ['d.ts'],
      'c.ts': ['d.ts'],
      'd.ts': [],
    });

    generateModuleTree(ctx, nodes.get('a.ts')!);

    expect(nodes.get('a.ts')!.children.size).toBe(2);
    expect(nodes.get('b.ts')!.children.has(nodes.get('d.ts')!)).toBe(true);
    expect(nodes.get('c.ts')!.children.has(nodes.get('d.ts')!)).toBe(true);
  });
});

describe(generateCycleNodesMap, () => {
  it('should detect simple two-node cycle', () => {
    const { ctx, nodes } = createGraphWithTree({
      'a.ts': ['b.ts'],
      'b.ts': ['a.ts'],
    });

    const result = generateCycleNodesMap(ctx, nodes.get('a.ts')!, createMockPluginContext());

    expect(result.size).toBe(1);
    const cycle = Array.from(result.values())[0];
    const ids = cycle.map((n) => n.id).sort();
    expect(ids).toEqual(['a.ts', 'b.ts']);
  });

  it('should detect three-node cycle', () => {
    const { ctx, nodes } = createGraphWithTree({
      'a.ts': ['b.ts'],
      'b.ts': ['c.ts'],
      'c.ts': ['a.ts'],
    });

    const result = generateCycleNodesMap(ctx, nodes.get('a.ts')!, createMockPluginContext());

    expect(result.size).toBe(1);
    const cycle = Array.from(result.values())[0];
    const ids = cycle.map((n) => n.id).sort();
    expect(ids).toEqual(['a.ts', 'b.ts', 'c.ts']);
  });

  it('should detect self-referencing cycle', () => {
    const { ctx, nodes } = createGraphWithTree({
      'self.ts': ['self.ts'],
    });

    const result = generateCycleNodesMap(ctx, nodes.get('self.ts')!, createMockPluginContext());

    expect(result.size).toBe(1);
    const cycle = Array.from(result.values())[0];
    expect(cycle).toHaveLength(1);
    expect(cycle[0].id).toBe('self.ts');
  });

  it('should not report single node without self-reference as cycle', () => {
    const { ctx, nodes } = createGraphWithTree({
      'a.ts': ['b.ts'],
      'b.ts': [],
    });

    const result = generateCycleNodesMap(ctx, nodes.get('a.ts')!, createMockPluginContext());

    expect(result.size).toBe(0);
  });

  it('should not report linear chain as cycle', () => {
    const { ctx, nodes } = createGraphWithTree({
      'a.ts': ['b.ts'],
      'b.ts': ['c.ts'],
      'c.ts': [],
    });

    const result = generateCycleNodesMap(ctx, nodes.get('a.ts')!, createMockPluginContext());

    expect(result.size).toBe(0);
  });

  it('should detect multiple independent cycles', () => {
    const { ctx, nodes } = createGraphWithTree({
      'root.ts': ['a.ts', 'c.ts'],
      'a.ts': ['b.ts'],
      'b.ts': ['a.ts'],
      'c.ts': ['d.ts'],
      'd.ts': ['c.ts'],
    });

    const result = generateCycleNodesMap(ctx, nodes.get('root.ts')!, createMockPluginContext());

    expect(result.size).toBe(2);
  });

  it('should call onDetected for each node in a cycle', () => {
    const onDetected = vi.fn();
    const { ctx, nodes } = createGraphWithTree(
      {
        'a.ts': ['b.ts'],
        'b.ts': ['a.ts'],
      },
      { onDetected },
    );

    generateCycleNodesMap(ctx, nodes.get('a.ts')!, createMockPluginContext());

    expect(onDetected).toHaveBeenCalledTimes(2);
    const calledIds = onDetected.mock.calls.map((call: unknown[]) => call[0]);
    expect(calledIds.sort()).toEqual(['a.ts', 'b.ts']);
  });

  it('should not call onDetected for same node twice', () => {
    const onDetected = vi.fn();
    const { ctx, nodes } = createGraphWithTree(
      {
        'a.ts': ['b.ts'],
        'b.ts': ['a.ts'],
      },
      { onDetected },
    );

    generateCycleNodesMap(ctx, nodes.get('a.ts')!, createMockPluginContext());

    const calledIds = onDetected.mock.calls.map((call: unknown[]) => call[0]);
    expect(new Set(calledIds).size).toBe(calledIds.length);
  });

  it('should return sorted nodes in each cycle', () => {
    const { ctx, nodes } = createGraphWithTree({
      'c.ts': ['b.ts'],
      'b.ts': ['a.ts'],
      'a.ts': ['c.ts'],
    });

    const result = generateCycleNodesMap(ctx, nodes.get('c.ts')!, createMockPluginContext());

    const cycle = Array.from(result.values())[0];
    const ids = cycle.map((n) => n.id);
    expect(ids).toEqual([...ids].sort());
  });

  it('should handle diamond with back-edge forming cycle', () => {
    const { ctx, nodes } = createGraphWithTree({
      'a.ts': ['b.ts', 'c.ts'],
      'b.ts': ['d.ts'],
      'c.ts': ['d.ts'],
      'd.ts': ['a.ts'],
    });

    const result = generateCycleNodesMap(ctx, nodes.get('a.ts')!, createMockPluginContext());

    expect(result.size).toBe(1);
    const cycle = Array.from(result.values())[0];
    const ids = cycle.map((n) => n.id).sort();
    expect(ids).toEqual(['a.ts', 'b.ts', 'c.ts', 'd.ts']);
  });

  it('should detect cycles in disconnected subgraphs reachable from root children', () => {
    const ctx = new Context({});
    const nodeA = createNodeWithImports('a.ts', []);
    const nodeB = createNodeWithImports('b.ts', []);
    const nodeC = createNodeWithImports('c.ts', []);

    ctx.moduleNodes.set('a.ts', nodeA);
    ctx.moduleNodes.set('b.ts', nodeB);
    ctx.moduleNodes.set('c.ts', nodeC);

    // Build tree normally, root only connects to b
    generateModuleTree(ctx, nodeA);

    // Manually add c as child of root (simulating a disconnected subgraph)
    nodeA.children.add(nodeC);
    // Create cycle: b <-> c (c not reachable from initial strongConnect on a)
    nodeC.children.add(nodeB);
    nodeB.children.add(nodeC);

    const result = generateCycleNodesMap(ctx, nodeA, createMockPluginContext());

    expect(result.size).toBe(1);
    const cycle = Array.from(result.values())[0];
    const ids = cycle.map((n) => n.id).sort();
    expect(ids).toEqual(['b.ts', 'c.ts']);
  });

  it.prop([graphArbitrary()])(
    'should return sorted nodes in every detected cycle for random graphs',
    (graphDef) => {
      const { ctx, nodes, rootId } = buildGraphFromDef(graphDef);

      const result = generateCycleNodesMap(ctx, nodes.get(rootId)!, createMockPluginContext());

      for (const cycle of result.values()) {
        const ids = cycle.map((n) => n.id);
        expect(ids).toEqual([...ids].sort());
      }
    },
  );

  it.prop([graphArbitrary()])(
    'should never report cycles in a DAG',
    (graphDef) => {
      const dagDef = toDag(graphDef);
      const { ctx, nodes, rootId } = buildGraphFromDef(dagDef);

      const result = generateCycleNodesMap(ctx, nodes.get(rootId)!, createMockPluginContext());

      expect(result.size).toBe(0);
    },
  );

  it.prop([graphArbitrary()])(
    'should detect every node in a cycle at least once via onDetected',
    (graphDef) => {
      const onDetected = vi.fn();
      const { ctx, nodes, rootId } = buildGraphFromDef(graphDef, { onDetected });

      const result = generateCycleNodesMap(ctx, nodes.get(rootId)!, createMockPluginContext());

      const detectedIds = new Set(onDetected.mock.calls.map((call: unknown[]) => call[0]));
      for (const cycle of result.values()) {
        for (const node of cycle) {
          expect(detectedIds.has(node.id)).toBe(true);
        }
      }
    },
  );
});

// Helpers

function createNodeWithImports(id: string, importedIds: string[]): ModuleNode {
  return new ModuleNode({ id, importedIds, dynamicallyImportedIds: [] } satisfies ModuleInfo);
}

function createGraph(edges: Record<string, string[]>) {
  const ctx = new Context({});
  const nodes = new Map<string, ModuleNode>();

  for (const [id, imports] of Object.entries(edges)) {
    const node = createNodeWithImports(id, imports);
    nodes.set(id, node);
    ctx.moduleNodes.set(id, node);
  }

  return { ctx, nodes };
}

function createLinearGraph(ids: string[]) {
  const edges: Record<string, string[]> = {};

  for (let i = 0; i < ids.length; i++) {
    edges[ids[i]] = i < ids.length - 1 ? [ids[i + 1]] : [];
  }

  return createGraph(edges);
}

function createGraphWithTree(
  edges: Record<string, string[]>,
  optionsOverrides: Record<string, unknown> = {},
) {
  const ctx = new Context(optionsOverrides as never);
  const nodes = new Map<string, ModuleNode>();

  for (const [id, imports] of Object.entries(edges)) {
    const node = createNodeWithImports(id, imports);
    nodes.set(id, node);
    ctx.moduleNodes.set(id, node);
  }

  const rootId = Object.keys(edges)[0];
  generateModuleTree(ctx, nodes.get(rootId)!);

  return { ctx, nodes };
}

function createMockPluginContext(): PluginContext {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } as unknown as PluginContext;
}

interface GraphDef {
  nodeCount: number;
  edges: Array<[number, number]>;
}

function graphArbitrary(): fc.Arbitrary<GraphDef> {
  return fc.integer({ min: 2, max: 10 }).chain((nodeCount) => {
    const edgeArb = fc.tuple(
      fc.integer({ min: 0, max: nodeCount - 1 }),
      fc.integer({ min: 0, max: nodeCount - 1 }),
    );

    return fc.array(edgeArb, { maxLength: nodeCount * 2 }).map((edges) => ({
      nodeCount,
      edges,
    }));
  });
}

function buildGraphFromDef(
  graphDef: GraphDef,
  optionsOverrides: Record<string, unknown> = {},
) {
  const nodeIds = Array.from({ length: graphDef.nodeCount }, (_, i) => `node${i}.ts`);
  const edgeMap: Record<string, string[]> = {};

  for (const id of nodeIds) {
    edgeMap[id] = [];
  }

  for (const [from, to] of graphDef.edges) {
    const fromId = nodeIds[from];
    const toId = nodeIds[to];

    if (!edgeMap[fromId].includes(toId)) {
      edgeMap[fromId].push(toId);
    }
  }

  // Root connects to all other nodes to ensure reachability
  const rootId = nodeIds[0];

  for (const id of nodeIds.slice(1)) {
    if (!edgeMap[rootId].includes(id)) {
      edgeMap[rootId].push(id);
    }
  }

  const ctx = new Context(optionsOverrides as never);
  const nodes = new Map<string, ModuleNode>();

  for (const [id, imports] of Object.entries(edgeMap)) {
    const node = createNodeWithImports(id, imports);
    nodes.set(id, node);
    ctx.moduleNodes.set(id, node);
  }

  generateModuleTree(ctx, nodes.get(rootId)!);

  return { ctx, nodes, rootId };
}

function toDag(graphDef: GraphDef): GraphDef {
  return {
    nodeCount: graphDef.nodeCount,
    edges: graphDef.edges.filter(([from, to]) => from < to),
  };
}
