import type { PluginContext } from 'rollup';

/**
 * Safely calls pluginContext.info() with a fallback to pluginContext.warn()
 * for Rollup v2 compatibility (info() was introduced in Rollup v3).
 */
export function pluginInfo(pluginContext: PluginContext, message: string): void {
  if (typeof pluginContext.info === 'function') {
    pluginContext.info(message);
  }
  else {
    pluginContext.warn(message);
  }
}
