'use client';

import { useDonutChart } from './useDonutChart';
import { useBarChart } from './useBarChart';
import { useTreeMapChart } from './useTreeMapChart';
import { useVariableRadiusPieChart } from './useVariableRadiusPieChart';
import { useSemiCirclePieChart } from './useSemiCirclePieChart';
import { useForceDirectedLinksChart } from './useForceDirectedLinksChart';
import { useMiniCharts } from './useMiniCharts';
import { useXYChart } from './useXYChart'; 

export const useChartManagement = () => {
  // Hooks para gráficos principales (vista previa lateral)
  const donutChart = useDonutChart();
  const barChart = useBarChart();
  const treeMapChart = useTreeMapChart();
  const variableRadiusPieChart = useVariableRadiusPieChart();
  const semiCirclePieChart = useSemiCirclePieChart();
  const forceDirectedChart = useForceDirectedLinksChart();
  const xyChart = useXYChart(); // Nuevo hook para gráfico XY principal

  // Hook para mini gráficos (dashboard con drag & drop)
  const miniCharts = useMiniCharts();

  const cleanupMainCharts = () => {
    try {
      donutChart.disposeDonut();
      barChart.disposeBars();
      treeMapChart.disposeTree();
      variableRadiusPieChart.disposeVariableRadiusPie();
      semiCirclePieChart.disposeSemiCircle();
      forceDirectedChart.disposeForceDirected();
      xyChart.disposeXYChart(); // Limpiar gráfico XY principal
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
    
    // Gráfico XY principal
    renderXYChart: xyChart.renderXYChart,
    
    // ======================================
    // FUNCIONES PARA MINI GRÁFICOS
    // (Dashboard - drag & drop)
    // ======================================
    renderMiniChart: miniCharts.renderMiniChart,
    
    // ======================================
    // FUNCIONES DE LIMPIEZA
    // ======================================
    
    // Limpiar solo gráficos principales
    cleanupMainCharts,
    
    // Limpiar gráfico XY específico
    disposeXYChart: xyChart.disposeXYChart,
    
    // Limpiar todos los gráficos (principales + mini)
    cleanupAllCharts,
    
    // Limpiar solo mini gráficos del dashboard
    disposeAllMiniCharts: miniCharts.disposeAllMiniCharts
  };
};