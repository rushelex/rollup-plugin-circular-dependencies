import { type PluginContext } from 'rollup';

import { Context } from './context';
import { ModuleNode } from './module';
import { type Options, type Plugin } from './types';
import { generateCycleNodesMap, generateModuleTree } from './utils/moduleTree';
import { printCycleNodes } from './utils/print';

export function circularDependencies(options: Options = {}): Plugin {
  const context = new Context(options);

  return {
    name: 'circular-dependencies',

    options(inputOptions) {
      const savedOnLog = inputOptions.onLog;

      inputOptions.onLog = (level, log, defaultHandler) => {
        if (log.code === 'CIRCULAR_DEPENDENCY') {
          return;
        }

        savedOnLog?.(level, log, defaultHandler);
      };
    },

    moduleParsed(moduleInfo) {
      if (!context.options.enabled || !context.shouldProcessModule(moduleInfo.id)) {
        return;
      }

      const moduleNode = new ModuleNode(moduleInfo);

      context.moduleNode = moduleNode;

      context.moduleNodes.set(moduleInfo.id, moduleNode);
    },

    generateBundle() {
      const pluginContext = this as unknown as PluginContext;

      if (!context.moduleNode) {
        if (context.options.enabled) {
          pluginContext.info(
            'No files to check. Check the "include" or "exclude" pattern in the "circular-dependencies" plugin options.',
          );
        }

        return;
      }

      context.options.onStart(pluginContext);

      generateModuleTree(context, context.moduleNode);

      const cycleNodes = generateCycleNodesMap(context, context.moduleNode, pluginContext);

      printCycleNodes(context, cycleNodes, pluginContext);
    },
  };
}

export { DefaultFormatters } from './utils/formatters';

// eslint-disable-next-line import/no-default-export
export default circularDependencies;
