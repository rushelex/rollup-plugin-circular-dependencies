import type { PluginContext } from 'rollup';

import { fc, it } from '@fast-check/vitest';

import { pluginInfo } from '../compat';

describe(pluginInfo, () => {
  describe('when pluginContext.info is available (Rollup v3+)', () => {
    it('should delegate to pluginContext.info', () => {
      const pluginCtx = createPluginContext({ hasInfo: true });

      pluginInfo(pluginCtx, 'detected 3 cycles');

      expect(pluginCtx.info).toHaveBeenCalledOnce();
      expect(pluginCtx.info).toHaveBeenCalledWith('detected 3 cycles');
    });

    it('should not fall back to pluginContext.warn', () => {
      const pluginCtx = createPluginContext({ hasInfo: true });

      pluginInfo(pluginCtx, 'test message');

      expect(pluginCtx.warn).not.toHaveBeenCalled();
    });

    it.prop([fc.string({ minLength: 1 })])(
      'should forward any message to pluginContext.info',
      (message) => {
        const pluginCtx = createPluginContext({ hasInfo: true });

        pluginInfo(pluginCtx, message);

        expect(pluginCtx.info).toHaveBeenCalledWith(message);
      },
    );
  });

  describe('when pluginContext.info is not available (Rollup v2)', () => {
    it('should fall back to pluginContext.warn', () => {
      const pluginCtx = createPluginContext({ hasInfo: false });

      pluginInfo(pluginCtx, 'detected 3 cycles');

      expect(pluginCtx.warn).toHaveBeenCalledOnce();
      expect(pluginCtx.warn).toHaveBeenCalledWith('detected 3 cycles');
    });

    it.prop([fc.string({ minLength: 1 })])(
      'should forward any message to pluginContext.warn',
      (message) => {
        const pluginCtx = createPluginContext({ hasInfo: false });

        pluginInfo(pluginCtx, message);

        expect(pluginCtx.warn).toHaveBeenCalledWith(message);
      },
    );
  });
});

// Helpers

interface CreatePluginContextOptions {
  hasInfo: boolean;
}

function createPluginContext({ hasInfo }: CreatePluginContextOptions): PluginContext {
  const base = {
    warn: vi.fn(),
    error: vi.fn(),
  };

  if (hasInfo) {
    return { ...base, info: vi.fn() } as unknown as PluginContext;
  }

  return base as unknown as PluginContext;
}
