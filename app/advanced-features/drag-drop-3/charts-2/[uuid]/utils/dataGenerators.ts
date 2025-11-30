import { ChartData, FormResponse } from '../types/types';

export const generateChartData = (
  responses: FormResponse[], 
  field: string, 
  maxLength?: number
): ChartData[] => {
  const counts: Record<string, number> = {};
  let total = 0;

  responses.forEach((r) => {
    const value = r.responses[field];
    
    if (value?.trim()) {
      if (value.includes(',')) {
        const items = value.split(',').map(item => item.trim()).filter(item => item);
        items.forEach((item) => {
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

  const result = Object.entries(counts)
    .map(([category, value]) => ({
      category: maxLength && category.length > maxLength ? 
        category.substring(0, maxLength) + '...' : category,
      fullCategory: category,
      value,
      realPercent: total > 0 ? ((value / total) * 100).toFixed(2) : '0.00',
    }))
    .sort((a, b) => b.value - a.value);

  return maxLength ? result.slice(0, maxLength) : result;
};

export const formatFieldName = (field: string): string => {
  const cleanField = field.replace(/__\d+$/, '').replace(/_/g, ' ');
  return cleanField.charAt(0).toUpperCase() + cleanField.slice(1).toLowerCase();
};