'use client';

import { useRef, useCallback } from 'react';

export const useMiniCharts = () => {
  const rootRefs = useRef<{ [key: string]: any }>({});
  const seriesRefs = useRef<{ [key: string]: any }>({});

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
    containerId: string,
    responses?: any[] // ← Respuestas completas como parámetro opcional
  ) => {
    console.log(`Renderizando mini chart ${type}:`, { 
      dataLength: data?.length, 
      field, 
      responsesLength: responses?.length 
    });

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

        case 'xy':
          // Para gráficos XY, usar las responses completas si están disponibles
          const [xField, yField] = field.split('___');
          const { renderMiniXYChart } = await import('./miniCharts/XYChartRenderer');
          
          // Usar responses si están disponibles, de lo contrario usar data
          const dataToUse = responses && responses.length > 0 ? responses : data;
          
          console.log('Datos para gráfico XY:', {
            usingResponses: !!responses,
            dataToUseLength: dataToUse.length,
            xField,
            yField
          });

          await renderMiniXYChart({
            responses: dataToUse, // ← Usar las respuestas completas
            xField,
            yField,
            xFieldName: xField,
            yFieldName: yField,
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