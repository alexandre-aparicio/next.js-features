'use client';

import { useDonutChart } from './useDonutChart';
import { useBarChart } from './useBarChart';
import { useTreeMapChart } from './useTreeMapChart';
import { useVariableRadiusPieChart } from './useVariableRadiusPieChart';
import { useSemiCirclePieChart } from './useSemiCirclePieChart';
import { useForceDirectedLinksChart } from './useForceDirectedLinksChart';
import { useMiniCharts } from './useMiniCharts';
import { useXYChart } from './useXYChart/useXYChart'; 
import { useXYChart2 } from './useXYChart/useXYChart2'; 
import { useXYChart3 } from './useXYChart/useXYChart3'; 

export const useChartManagement = () => {
  // Hooks para gráficos principales (vista previa lateral)
  const donutChart = useDonutChart();
  const barChart = useBarChart();
  const treeMapChart = useTreeMapChart();
  const variableRadiusPieChart = useVariableRadiusPieChart();
  const semiCirclePieChart = useSemiCirclePieChart();
  const forceDirectedChart = useForceDirectedLinksChart();
  const xyChart = useXYChart(); 
  const xyChart2 = useXYChart2(); 
  const xyChart3 = useXYChart3();
  const miniCharts = useMiniCharts();

  const cleanupMainCharts = () => {
    try {
      donutChart.disposeDonut();
      barChart.disposeBars();
      treeMapChart.disposeTree();
      variableRadiusPieChart.disposeVariableRadiusPie();
      semiCirclePieChart.disposeSemiCircle();
      forceDirectedChart.disposeForceDirected();
      xyChart.disposeXYChart(); // Limpiar gráfico XY 1
      xyChart2.disposeXYChart2(); // Limpiar gráfico XY 2
      xyChart3.disposeXYChart3(); // Limpiar gráfico XY 3
    } catch (err) {
      console.warn('Error cleaning up main charts:', err);
    }
  };

  const cleanupAllCharts = () => {
    try {
      cleanupMainCharts();
      miniCharts.disposeAllMiniCharts(); // Limpiar mini gráficos del dashboard
    } catch (err) {
      console.warn('Error cleaning up all charts:', err);
    }
  };

  return {
    // ======================================
    // FUNCIONES PARA GRÁFICOS PRINCIPALES
    // (Vista previa lateral - ChartControls)
    // ======================================
    
    // Gráficos de campo individual
    renderDonut: donutChart.renderDonut,
    renderBars: barChart.renderBars,
    renderTree: treeMapChart.renderTree,
    renderVariableRadiusPie: variableRadiusPieChart.renderVariableRadiusPie,
    renderSemiCircle: semiCirclePieChart.renderSemiCircle,
    renderForceDirected: forceDirectedChart.renderForceDirected,
    
    // Gráficos XY principales
    renderXYChart: xyChart.renderXYChart,        // XY 1 - Dispersión
    renderXYChart2: xyChart2.renderXYChart2,     // XY 2 - Líneas
    renderXYChart3: xyChart3.renderXYChart3,     // XY 3 - Barras
    
    // ======================================
    // FUNCIONES PARA MINI GRÁFICOS
    // (Dashboard - drag & drop)
    // ======================================
    renderMiniChart: miniCharts.renderMiniChart,
    

    cleanupMainCharts,

    disposeXYChart: xyChart.disposeXYChart,
    disposeXYChart2: xyChart2.disposeXYChart2,
    disposeXYChart3: xyChart3.disposeXYChart3,
    cleanupAllCharts,

    disposeAllMiniCharts: miniCharts.disposeAllMiniCharts
  };
};