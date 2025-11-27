// utils/chartUtils.ts

interface RenderConfig {
  render: () => Promise<void> | void;
  delay?: number;
  name?: string;
}

/**
 * Ejecuta cleanup de múltiples gráficos
 */
export const cleanupCharts = (disposeFunctions: Array<() => void>): void => {
  disposeFunctions.forEach(dispose => {
    try {
      dispose();
    } catch (e) {
      console.warn('Error cleaning up chart:', e);
    }
  });
};

/**
 * Renderiza gráficos con delays secuenciales
 */
export const renderChartsSequentially = async (
  renderConfigs: RenderConfig[]
): Promise<void> => {
  for (let i = 0; i < renderConfigs.length; i++) {
    const config = renderConfigs[i];
    await new Promise<void>(resolve => {
      setTimeout(async () => {
        try {
          await config.render();
          console.log(`${config.name || `Chart ${i + 1}`} rendered`);
        } catch (error) {
          console.error(`Error rendering ${config.name || `chart ${i + 1}`}:`, error);
        }
        resolve();
      }, config.delay || (i * 200));
    });
  }
};

/**
 * Valida si los campos son válidos para gráficos bivariados
 */
export const isValidBivariateConfig = (
  xAxisField: string, 
  yAxisField: string, 
  responsesLength: number
): boolean => {
  return !!(xAxisField && yAxisField && xAxisField !== yAxisField && responsesLength > 0);
};