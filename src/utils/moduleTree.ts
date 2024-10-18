import type { PluginContext } from 'rollup';

import type { Context } from '../context';
import type { ModuleNode } from '../module';

export function generateModuleTree(ctx: Context, rootModuleNode: ModuleNode) {
  const createdModuleNode = new Set<string>();
  const moduleNodes = ctx.moduleNodes;

  function getModuleChildNodes(node: ModuleNode): ModuleNode[] {
    return node.importedIds.reduce<ModuleNode[]>((acc, moduleId) => {
      const moduleNode = moduleNodes.get(moduleId);

      if (moduleNode) {
        acc.push(moduleNode);
      }

      return acc;
    }, []);
  }

  function recursionBuild(node: ModuleNode) {
    // For each traversal, first put yourself into the generated set to avoid referencing your own scene.
    createdModuleNode.add(node.id);

    const childNodes = getModuleChildNodes(node);

    for (const childNode of childNodes) {
      // The current subtree is not generated, then recursion
      if (!createdModuleNode.has(childNode.id)) {
        recursionBuild(childNode);
      }

      node.children.add(childNode);
    }
  }

  recursionBuild(rootModuleNode);
}

export function generateCycleNodesMap(ctx: Context, rootModuleNode: ModuleNode, pluginContext: PluginContext) {
  // Used to store the last traversed nodes with circular dependencies.
  const cycleNodesMap = new Map<string, ModuleNode[]>();

  // Save the nodes that have been DFSed to avoid repeated traversal
  const visitedNodeIds = new Set<string>();

  // Save the unique node ids to call onDetected
  const detectedNodeIds = new Set<string>();

  function depthFirstTraversal(node: ModuleNode, visitedPaths: Set<string>) {
    // Has been visited and ends directly
    if (visitedNodeIds.has(node.id)) {
      return;
    }

    // First add yourself to the path to avoid situations where you reference yourself.
    visitedPaths.add(node.id);

    for (const childNode of node.children) {
      if (visitedPaths.has(childNode.id)) {
        if (!detectedNodeIds.has(childNode.id)) {
          ctx.options.onDetected(childNode.id, pluginContext);
        }

        detectedNodeIds.add(childNode.id);

        generateAndInsertCycleNodes(childNode, visitedPaths, cycleNodesMap);
      }
      else {
        depthFirstTraversal(childNode, visitedPaths);
      }
    }

    visitedNodeIds.add(node.id);

    // Pop the current node out of the path
    visitedPaths.delete(node.id);
  }

  depthFirstTraversal(rootModuleNode, new Set());

  return cycleNodesMap;
}

function generateAndInsertCycleNodes(
  node: ModuleNode,
  visitedPaths: Set<string>,
  cycleNodesMap: Map<string, ModuleNode[]>,
) {
  const cycleNodes: ModuleNode[] = [];

  let currentNode: ModuleNode | undefined = node;

  do {
    cycleNodes.push(currentNode);

    if (currentNode.children.size === 0) {
      break;
    }

    currentNode = Array.from(currentNode.children).find((item) => visitedPaths.has(item.id));
  } while (currentNode && currentNode !== node);

  const sortedCycleNodes = cycleNodes.sort((a, b) => (a.id < b.id ? -1 : 1));

  const cycleNodeId = sortedCycleNodes.map((item) => item.id).join('-');

  cycleNodesMap.set(cycleNodeId, sortedCycleNodes);
}
