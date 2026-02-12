import type { PluginContext } from 'rollup';

import type { Context } from '../context';
import type { ModuleNode } from '../module';
import type { CircularDependenciesData, FormattedData, Metrics } from '../types';

import { createPrinters } from './printers';

/**
 * Processes detected cycles: formats, filters, prints, and validates results.
 * Collects metrics and invokes lifecycle callbacks.
 */
export function printCycleNodes(
  ctx: Context,
  cycleNodes: Map<string, ModuleNode[]>,
  pluginContext: PluginContext,
  detectionStartTime: number,
): void {
  const rawData = buildRawData(cycleNodes);

  const filteredData = applyIgnoreFilter(ctx, rawData);

  const transformedData = transformNodePaths(ctx, filteredData);
  const formattedData = ctx.options.formatOut(transformedData) as FormattedData;

  const metrics = collectMetrics(ctx, filteredData, detectionStartTime);

  if (ctx.options.debug) {
    logDebugInfo(pluginContext, metrics, filteredData);
  }

  ctx.options.onEnd(
    {
      rawOutput: filteredData,
      formattedOutput: formattedData,
      metrics,
    },
    pluginContext,
  );

  for (const printer of createPrinters({ context: ctx })) {
    if (printer.shouldPrint(formattedData)) {
      printer.print(formattedData);
    }
  }

  validateCycleData(filteredData, ctx, pluginContext);
}

function buildRawData(data: Map<string, ModuleNode[]>): CircularDependenciesData {
  return groupByFirstNodePath(getNodePaths(filterEmptyNodes(data)));
}

function filterEmptyNodes(cycleNodesMap: Map<string, ModuleNode[]>): ModuleNode[][] {
  return Array.from(cycleNodesMap.values()).filter((item) => item.length > 0);
}

function getNodePaths(data: ModuleNode[][]): Array<Array<ModuleNode['id']>> {
  return data.map((nodeArr) => nodeArr.map((item) => item.id));
}

function groupByFirstNodePath(data: Array<Array<ModuleNode['id']>>): CircularDependenciesData {
  return data.reduce<CircularDependenciesData>((acc, curNodes) => {
    const firstNodeId = curNodes[0];
    acc[firstNodeId] ??= [];
    acc[firstNodeId].push(curNodes);
    return acc;
  }, {});
}

function applyIgnoreFilter(ctx: Context, data: CircularDependenciesData): CircularDependenciesData {
  const { ignoreCycle } = ctx.options;

  const filtered: CircularDependenciesData = {};

  for (const [nodeId, cycles] of Object.entries(data)) {
    const remainingCycles = cycles.filter((cyclePaths) => !ignoreCycle(cyclePaths));

    if (remainingCycles.length > 0) {
      filtered[nodeId] = remainingCycles;
    }
  }

  return filtered;
}

function transformNodePaths(ctx: Context, data: CircularDependenciesData): CircularDependenciesData {
  const transformedData: CircularDependenciesData = {};

  for (const [nodeId, cycles] of Object.entries(data)) {
    const transformedKey = ctx.options.formatOutModulePath(nodeId);

    transformedData[transformedKey] = cycles.map((cycle) => {
      return cycle.map((id) => ctx.options.formatOutModulePath(id));
    });
  }

  return transformedData;
}

function collectMetrics(
  ctx: Context,
  data: CircularDependenciesData,
  detectionStartTime: number,
): Metrics {
  const allCycles = Object.values(data).flat();
  const largestCycleSize = allCycles.reduce((max, cycle) => Math.max(max, cycle.length), 0);

  return {
    modulesChecked: ctx.moduleNodes.size,
    cyclesFound: allCycles.length,
    largestCycleSize,
    detectionTimeMs: performance.now() - detectionStartTime,
  };
}

function logDebugInfo(
  pluginContext: PluginContext,
  metrics: Metrics,
  data: CircularDependenciesData,
): void {
  pluginContext.info(
    `[circular-dependencies] Checked ${metrics.modulesChecked} modules in ${metrics.detectionTimeMs.toFixed(1)}ms. `
    + `Found ${metrics.cyclesFound} cycle(s), largest cycle size: ${metrics.largestCycleSize}.`,
  );

  for (const [nodeId, cycles] of Object.entries(data)) {
    for (const cycle of cycles) {
      pluginContext.info(`[circular-dependencies] Cycle: ${nodeId} → ${cycle.join(' → ')}`);
    }
  }
}

function validateCycleData(
  data: CircularDependenciesData,
  ctx: Context,
  pluginContext: PluginContext,
): void {
  const cycleCount = Object.values(data).flat().length;

  if (cycleCount === 0) {
    return;
  }

  const handler = ctx.options.throwOnError ? pluginContext.error : pluginContext.warn;
  handler(`Circular dependencies detected: ${cycleCount} cycle(s) found`);
}
