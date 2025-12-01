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
    responses?: any[]
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

        case 'xyChart': // ← NUEVO: Gráfico de dispersión (barras apiladas)
          const [xField1, yField1] = field.split('___');
          const { renderMiniXYChart } = await import('./miniCharts/XyCharts/XyChartRenderer');
          
          const dataToUse1 = responses && responses.length > 0 ? responses : data;
          
          console.log('Datos para gráfico XY (Dispersión):', {
            usingResponses: !!responses,
            dataToUseLength: dataToUse1.length,
            xField: xField1,
            yField: yField1
          });

          await renderMiniXYChart({
            responses: dataToUse1,
            xField: xField1,
            yField: yField1,
            xFieldName: xField1,
            yFieldName: yField1,
            containerId,
            rootRefs,
            seriesRefs,
            safeDispose
          });
          break;

        case 'xyChart-2': // ← NUEVO: Gráfico de líneas (radar)
          const [xField2, yField2] = field.split('___');
          const { renderMiniXYChart2 } = await import('./miniCharts/XyCharts/XyChart2Renderer');
          
          const dataToUse2 = responses && responses.length > 0 ? responses : data;
          
          console.log('Datos para gráfico XY-2 (Radar):', {
            usingResponses: !!responses,
            dataToUseLength: dataToUse2.length,
            xField: xField2,
            yField: yField2
          });

          await renderMiniXYChart2({
            responses: dataToUse2,
            xField: xField2,
            yField: yField2,
            xFieldName: xField2,
            yFieldName: yField2,
            containerId,
            rootRefs,
            seriesRefs,
            safeDispose
          });
          break;

        case 'xyChart-3': // ← NUEVO: Gráfico de barras agrupadas
          const [xField3, yField3] = field.split('___');
          const { renderMiniXYChart3 } = await import('./miniCharts/XyCharts/XyChart3Renderer');
          
          const dataToUse3 = responses && responses.length > 0 ? responses : data;
          
          console.log('Datos para gráfico XY-3 (Barras):', {
            usingResponses: !!responses,
            dataToUseLength: dataToUse3.length,
            xField: xField3,
            yField: yField3
          });

          await renderMiniXYChart3({
            responses: dataToUse3,
            xField: xField3,
            yField: yField3,
            xFieldName: xField3,
            yFieldName: yField3,
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