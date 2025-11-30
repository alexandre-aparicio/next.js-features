'use client';

import { useDonutChart } from './useDonutChart';
import { useBarChart } from './useBarChart';
import { useTreeMapChart } from './useTreeMapChart';
import { useVariableRadiusPieChart } from './useVariableRadiusPieChart';
import { useSemiCirclePieChart } from './useSemiCirclePieChart';
import { useForceDirectedLinksChart } from './useForceDirectedLinksChart';
import { useMiniCharts } from './useMiniCharts';

export const useChartManagement = () => {
  const donutChart = useDonutChart();
  const barChart = useBarChart();
  const treeMapChart = useTreeMapChart();
  const variableRadiusPieChart = useVariableRadiusPieChart();
  const semiCirclePieChart = useSemiCirclePieChart();
  const forceDirectedChart = useForceDirectedLinksChart();
  const miniCharts = useMiniCharts();

  const cleanupMainCharts = () => {
    try {
      donutChart.disposeDonut();
      barChart.disposeBars();
      treeMapChart.disposeTree();
      variableRadiusPieChart.disposeVariableRadiusPie();
      semiCirclePieChart.disposeSemiCircle();
      forceDirectedChart.disposeForceDirected();
    } catch (err) {
      console.warn('Error cleaning up main charts:', err);
    }
  };

  const cleanupAllCharts = () => {
    try {
      cleanupMainCharts();
      miniCharts.disposeAllMiniCharts();
    } catch (err) {
      console.warn('Error cleaning up all charts:', err);
    }
  };

  return {
    // Funciones de renderizado
    renderDonut: donutChart.renderDonut,
    renderBars: barChart.renderBars,
    renderTree: treeMapChart.renderTree,
    renderVariableRadiusPie: variableRadiusPieChart.renderVariableRadiusPie,
    renderSemiCircle: semiCirclePieChart.renderSemiCircle,
    renderForceDirected: forceDirectedChart.renderForceDirected,
    renderMiniChart: miniCharts.renderMiniChart,
    
    // Funciones de limpieza
    cleanupMainCharts,
    cleanupAllCharts,
    disposeAllMiniCharts: miniCharts.disposeAllMiniCharts
  };
};