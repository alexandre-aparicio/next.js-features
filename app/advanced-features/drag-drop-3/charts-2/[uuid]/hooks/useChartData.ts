import { useMemo, useCallback } from 'react';

export interface ChartDataItem {
  category: string;
  fullCategory: string;
  value: number;
  realPercent: string;
}

export const useChartData = (responses: any[]) => {
  const generateChartData = useCallback((field: string, maxLength: number = 20): ChartDataItem[] => {
    const counts: Record<string, number> = {};
    let total = 0;

    responses.forEach((r) => {
      const value = r.responses[field];
      
      if (value?.trim()) {
        if (value.includes(',')) {
          const items = value.split(',').map((item: string) => item.trim()).filter((item: string) => item);
          items.forEach((item: string) => {
            if (item) {
              counts[item] = (counts[item] || 0) + 1;
              total++;
            }
          });
        } else {
          counts[value] = (counts[value] || 0) + 1;
          total++;
        }
      }
    });

    return Object.entries(counts)
      .map(([category, value]) => ({
        category: category.length > maxLength ? category.substring(0, maxLength) + '...' : category,
        fullCategory: category,
        value,
        realPercent: total > 0 ? ((value / total) * 100).toFixed(2) : '0.00',
      }))
      .sort((a, b) => b.value - a.value);
  }, [responses]);

  const generateMiniChartData = useCallback((field: string) => {
    return generateChartData(field, 12).slice(0, 6);
  }, [generateChartData]);

  return {
    generateChartData,
    generateMiniChartData
  };
};