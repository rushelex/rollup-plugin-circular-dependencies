import type { Plugin, PluginContext } from 'rollup';

import type { Options } from './types';

import { PLUGIN_NAME, ROLLUP_CIRCULAR_DEPENDENCY_CODE } from './constants';
import { Context } from './context';
import { ModuleNode } from './module';
import { generateCycleNodesMap, generateModuleTree, pluginInfo, printCycleNodes } from './utils';

/** Rollup v2 warning handler shape (before `onLog` was introduced in v3) */
type LegacyOnWarn = (
  warning: string | { code?: string; message: string },
  defaultHandler: (warning: string | { code?: string; message: string }) => void,
) => void;

/**
 * Creates a Rollup plugin that detects circular dependencies in your project.
 * Works with both Rollup and Vite.
 *
 * @param options - Plugin configuration options
 * @returns Rollup plugin instance
 *
 * @example
 * ```ts
 * // Basic usage
 *
 * import circularDependencies from 'rollup-plugin-circular-dependencies';
 *
 * export default {
 *   plugins: [circularDependencies()]
 * }
 * ```
 *
 * @example
 * ```ts
 * // Advanced usage
 *
 * import circularDependencies, { DefaultFormatters } from 'rollup-plugin-circular-dependencies';
 *
 * export default {
 *   plugins: [
 *     circularDependencies({
 *       enabled: true,
 *       exclude: [/node_modules/],
 *       throwOnError: true,
 *       debug: false,
 *       formatOut: DefaultFormatters.Pretty({ colors: false }),
 *       ignoreCycle: (paths) => paths.some(p => p.includes('generated')),
 *       onStart: (pluginContext) => {},
 *       onDetected: (modulePath, pluginContext) => {},
 *       onEnd: ({ rawOutput, formattedOutput, metrics }, pluginContext) => {
 *         console.log(`Found ${metrics.cyclesFound} cycle(s)`);
 *       },
 *     })
 *   ]
 * }
 * ```
 */
function circularDependencies(options: Options = {}): Plugin {
  const context = new Context(options);

  return {
    name: PLUGIN_NAME,

    options(inputOptions) {
      if ('onLog' in inputOptions) {
        const savedOnLog = inputOptions.onLog;

        inputOptions.onLog = (level, log, defaultHandler) => {
          if (log.code === ROLLUP_CIRCULAR_DEPENDENCY_CODE) {
            return;
          }

          if (savedOnLog) {
            savedOnLog(level, log, defaultHandler);
          }
          else {
            defaultHandler(level, log);
          }
        };
      }
      else {
        // Rollup v2 compat: `onwarn` instead of `onLog`
        const opts = inputOptions as unknown as { onwarn?: LegacyOnWarn };
        const savedOnWarn = opts.onwarn;

        opts.onwarn = (warning, defaultHandler) => {
          const code = typeof warning === 'string' ? undefined : warning.code;

          if (code === ROLLUP_CIRCULAR_DEPENDENCY_CODE) {
            return;
          }

          if (savedOnWarn) {
            savedOnWarn(warning, defaultHandler);
          }
          else {
            defaultHandler(warning);
          }
        };
      }
    },

    moduleParsed(moduleInfo) {
      if (!context.options.enabled || !context.shouldProcessModule(moduleInfo.id)) {
        return;
      }

      const moduleNode = new ModuleNode(moduleInfo);

      context.setEntryModuleNode(moduleNode);
      context.moduleNodes.set(moduleInfo.id, moduleNode);
    },

    generateBundle() {
      const pluginContext = this as unknown as PluginContext;

      if (!context.entryModuleNode) {
        if (context.options.enabled) {
          pluginInfo(
            pluginContext,
            'No files to check. Check the "include" or "exclude" pattern in the "circular-dependencies" plugin options.',
          );
        }

        return;
      }

      const detectionStartTime = performance.now();

      context.options.onStart(pluginContext);

      generateModuleTree(context, context.entryModuleNode);

      const cycleNodes = generateCycleNodesMap(context, context.entryModuleNode, pluginContext);

      printCycleNodes(context, cycleNodes, pluginContext, detectionStartTime);

      context.reset();
    },
  };
}

export type { CircularDependenciesData, FormattedData, Metrics, Options } from './types';

export { DefaultFormatters } from './utils';

export { circularDependencies };

export default circularDependencies;
