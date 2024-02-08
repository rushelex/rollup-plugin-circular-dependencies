import { type PluginContext } from 'rollup';

import { type Context } from '../context';
import { type ModuleNode } from '../module';
import { type CircularDependenciesData } from '../types';

import { createPrinters } from './printers';

const ERROR_MESSAGE = 'Circular dependencies has been detected';

export function printCycleNodes(ctx: Context, cycleNodes: Map<string, ModuleNode[]>, pluginContext: PluginContext) {
  const rawData = getRawData(cycleNodes);

  const formattedData = ctx.options.formatOut(transformNodePaths(ctx, rawData));

  ctx.options.onEnd(
    {
      rawOutput: rawData,
      formattedOutput: formattedData,
    },
    pluginContext,
  );

  for (const printer of createPrinters({ context: ctx })) {
    if (printer.shouldPrint(formattedData)) {
      printer.print(formattedData);
    }
  }

  validateCycleData(rawData, ctx, pluginContext);
}

function getRawData(data: Map<string, ModuleNode[]>) {
  return groupByFirstNodePath(getNodePaths(filterNodes(data)));
}

function filterNodes(cycleNodesMap: Map<string, ModuleNode[]>) {
  return Array.from(cycleNodesMap.values()).filter((item) => item.length);
}

function getNodePaths(data: ModuleNode[][]): Array<Array<ModuleNode['id']>> {
  return data.map((nodeArr) => {
    return nodeArr.map((item) => {
      return item.id;
    });
  });
}

function groupByFirstNodePath(data: Array<Array<ModuleNode['id']>>) {
  return data.reduce<CircularDependenciesData>((acc, curNodes) => {
    const firstNodeId = curNodes[0];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    acc[firstNodeId] ??= [];

    acc[firstNodeId].push(curNodes);

    return acc;
  }, {});
}

function transformNodePaths(ctx: Context, data: CircularDependenciesData): CircularDependenciesData {
  const transformedData: CircularDependenciesData = {};

  for (const [nodeId, cycles] of Object.entries(data)) {
    transformedData[ctx.options.formatOutModulePath(nodeId)] = cycles.map((cycle) => {
      return cycle.map((nodeId) => {
        return ctx.options.formatOutModulePath(nodeId);
      });
    });
  }

  return transformedData;
}

function validateCycleData(data: CircularDependenciesData, ctx: Context, pluginContext: PluginContext) {
  const handler = ctx.options.throwOnError ? pluginContext.error : pluginContext.warn;

  if (Object.keys(data).length > 0) {
    handler(ERROR_MESSAGE);
  }
}
