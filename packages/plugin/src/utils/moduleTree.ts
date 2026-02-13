import type { PluginContext } from 'rollup';

import type { Context } from '../context';
import type { ModuleNode } from '../module';

/**
 * Builds the module dependency tree by resolving imported IDs
 * into actual ModuleNode references stored as children.
 */
export function generateModuleTree(ctx: Context, rootModuleNode: ModuleNode): void {
  const visited = new Set<string>();
  const moduleNodes = ctx.moduleNodes;

  function resolveChildren(node: ModuleNode): ModuleNode[] {
    return node.importedIds
      .map((id) => moduleNodes.get(id))
      .filter((n) => n !== undefined);
  }

  function buildTree(node: ModuleNode): void {
    visited.add(node.id);

    const children = resolveChildren(node);

    for (const child of children) {
      if (!visited.has(child.id)) {
        buildTree(child);
      }

      node.children.add(child);
    }
  }

  buildTree(rootModuleNode);
}

/**
 * Detects all circular dependencies using Tarjan's algorithm
 * for finding strongly connected components (SCCs).
 * Runs in O(V + E) time complexity.
 */
export function generateCycleNodesMap(
  ctx: Context,
  rootModuleNode: ModuleNode,
  pluginContext: PluginContext,
): Map<string, ModuleNode[]> {
  const cycleNodesMap = new Map<string, ModuleNode[]>();

  const sccs = findStronglyConnectedComponents(rootModuleNode);

  for (const scc of sccs) {
    // Single-node SCCs are only cycles if they self-reference
    if (scc.length === 1) {
      const node = scc[0];
      const hasSelfRef = node.children.has(node);

      if (!hasSelfRef) {
        continue;
      }
    }

    for (const node of scc) {
      ctx.options.onDetected(node.id, pluginContext);
    }

    const cycleId = normalizeCycleId(scc);
    cycleNodesMap.set(cycleId, normalizeCycleNodes(scc));
  }

  return cycleNodesMap;
}

/** Creates a deterministic ID for a cycle by sorting node IDs */
function normalizeCycleId(nodes: ModuleNode[]): string {
  return nodes
    .map((node) => node.id)
    .sort()
    .join('-');
}

/** Returns a sorted copy of cycle nodes for consistent output */
function normalizeCycleNodes(nodes: ModuleNode[]): ModuleNode[] {
  return [...nodes].sort((a, b) => (a.id < b.id ? -1 : 1));
}

/**
 * Tarjan's algorithm for finding all strongly connected components.
 * Each SCC with more than one node (or a self-referencing single node)
 * represents a circular dependency.
 *
 * @see https://en.wikipedia.org/wiki/Tarjan%27s_strongly_connected_components_algorithm
 */
function findStronglyConnectedComponents(root: ModuleNode): ModuleNode[][] {
  let index = 0;
  const stack: ModuleNode[] = [];
  const onStack = new Set<string>();
  const indices = new Map<string, number>();
  const lowLinks = new Map<string, number>();
  const result: ModuleNode[][] = [];

  function strongConnect(node: ModuleNode): void {
    indices.set(node.id, index);
    lowLinks.set(node.id, index);
    index++;

    stack.push(node);
    onStack.add(node.id);

    for (const child of node.children) {
      if (!indices.has(child.id)) {
        strongConnect(child);
        lowLinks.set(node.id, Math.min(lowLinks.get(node.id)!, lowLinks.get(child.id)!));
      }
      else if (onStack.has(child.id)) {
        lowLinks.set(node.id, Math.min(lowLinks.get(node.id)!, indices.get(child.id)!));
      }
    }

    if (lowLinks.get(node.id) === indices.get(node.id)) {
      const scc: ModuleNode[] = [];
      let current: ModuleNode;

      do {
        current = stack.pop()!;
        onStack.delete(current.id);
        scc.push(current);
      } while (current !== node);

      result.push(scc);
    }
  }

  strongConnect(root);

  return result;
}
