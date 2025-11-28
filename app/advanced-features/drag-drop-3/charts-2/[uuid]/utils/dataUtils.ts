// utils/dataUtils.ts
import { FormResponse } from '../services/getFormResponses';

export interface ChartData {
  category: string;
  value: number;
  fullCategory?: string;
  realPercent?: string;
}

export interface CrossTabData {
  category: string;
  [key: string]: number | string;
}

/**
 * Extrae campos únicos del formulario
 */
export const extractFormFields = (responses: FormResponse[]): string[] => {
  if (!responses || responses.length === 0) return [];
  
  const fields = new Set<string>();
  responses.forEach((r) => {
    if (r.responses) {
      Object.keys(r.responses).forEach((f) => fields.add(f));
    }
  });
  return Array.from(fields).sort();
};

/**
 * Procesa datos para gráficos univariados
 */
export const processUnivariateData = (responses: FormResponse[], field: string): ChartData[] => {
  if (!responses || responses.length === 0 || !field) return [];
  
  const counts: Record<string, number> = {};
  let total = 0;

  responses.forEach((r) => {
    const value = r.responses?.[field];
    if (value?.trim()) {
      counts[value] = (counts[value] || 0) + 1;
      total++;
    }
  });

  return Object.entries(counts)
    .map(([category, value]) => ({
      category: category.length > 20 ? category.substring(0, 20) + '...' : category,
      fullCategory: category,
      value,
      realPercent: total > 0 ? ((value / total) * 100).toFixed(2) : '0.00'
    }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Procesa datos para gráficos bivariados (stacked, clustered, overlapped)
 */
export const processBivariateData = (
  responses: FormResponse[], 
  xAxisField: string, 
  yAxisField: string
): { data: CrossTabData[], series: string[] } => {
  if (!responses || responses.length === 0 || !xAxisField || !yAxisField) {
    return { data: [], series: [] };
  }
  
  const xValues = Array.from(new Set(
    responses
      .map(r => r.responses?.[xAxisField] || '')
      .filter(val => val && val.trim())
  ));
  
  const yValues = Array.from(new Set(
    responses
      .map(r => r.responses?.[yAxisField] || '')
      .filter(val => val && val.trim())
  ));

  const data: CrossTabData[] = xValues.map(xVal => {
    const dataPoint: CrossTabData = { 
      category: xVal.length > 20 ? xVal.substring(0, 20) + '...' : xVal 
    };
    
    yValues.forEach(yVal => {
      dataPoint[yVal] = 0;
    });

    responses.forEach(r => {
      const currentX = r.responses?.[xAxisField];
      const currentY = r.responses?.[yAxisField];
      if (currentX === xVal && currentY?.trim()) {
        dataPoint[currentY] = (dataPoint[currentY] as number) + 1;
      }
    });

    return dataPoint;
  });

  return { data, series: yValues };
};