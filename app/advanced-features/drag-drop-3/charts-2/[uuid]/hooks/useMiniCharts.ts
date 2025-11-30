'use client';

import { useRef, useCallback } from 'react';

export const useMiniCharts = () => {
  const rootRefs = useRef<{ [key: string]: any }>({});
  const seriesRefs = useRef<{ [key: string]: any }>({});

  // Función segura para limpiar gráficos
  const safeDispose = useCallback((chartId: string) => {
    try {
      if (rootRefs.current[chartId]) {
        console.log(`Limpiando gráfico: ${chartId}`);
        rootRefs.current[chartId].dispose();
        delete rootRefs.current[chartId];
      }
      if (seriesRefs.current[chartId]) {
        delete seriesRefs.current[chartId];
      }
    } catch (error) {
      console.warn(`Error limpiando gráfico ${chartId}:`, error);
    }
  }, []);

  const renderMiniChart = useCallback(async (
    type: string, 
    data: any[], 
    field: string, 
    containerId: string
  ) => {
    if (!data || data.length === 0) {
      console.warn('No hay datos para renderizar el gráfico');
      return;
    }

    try {
      switch (type) {
        case 'bar':
          const { renderMiniBars } = await import('./miniCharts/barChartRenderer');
          await renderMiniBars({
            data,
            fieldName: field,
            containerId,
            rootRefs,
            seriesRefs,
            safeDispose
          });
          break;
        
        case 'donut':
          const { renderMiniDonut } = await import('./miniCharts/donutChartRenderer');
          await renderMiniDonut({
            data,
            fieldName: field,
            containerId,
            rootRefs,
            seriesRefs,
            safeDispose
          });
          break;
        
        default:
          console.warn(`Tipo de gráfico no soportado: ${type}`);
          return;
      }
    } catch (error) {
      console.error(`Error renderizando mini chart ${type}:`, error);
    }
  }, [safeDispose]);

  const disposeChart = useCallback((containerId: string) => {
    safeDispose(containerId);
  }, [safeDispose]);

  const disposeAllMiniCharts = useCallback(() => {
    console.log('Limpiando todos los mini gráficos');
    Object.keys(rootRefs.current).forEach(containerId => {
      safeDispose(containerId);
    });
  }, [safeDispose]);

  return {
    renderMiniChart,
    disposeChart,
    disposeAllMiniCharts
  };
};