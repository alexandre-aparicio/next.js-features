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

export const generateXYData = (
  responses: FormResponse[], 
  xField: string, 
  yField: string
): any[] => {
  // Estructura para mapear valores X -> valores Y -> conteos
  const dataMap: Record<string, Record<string, number>> = {};
  const allYValues = new Set<string>();
  
  console.log('Generando datos XY para:', { xField, yField, totalRespuestas: responses.length });

  // Procesar todas las respuestas
  responses.forEach((response, index) => {
    const xValue = response.responses[xField];
    const yValueRaw = response.responses[yField];
    
    console.log(`Respuesta ${index}:`, { xValue, yValueRaw });

    if (xValue?.trim() && yValueRaw?.trim()) {
      // Separar valores X si hay comas (algunos campos X también pueden tener múltiples valores)
      const xValues = xValue.includes(',') 
        ? xValue.split(',').map(item => item.trim()).filter(item => item)
        : [xValue];
      
      // Separar valores Y si hay comas
      const yValues = yValueRaw.includes(',') 
        ? yValueRaw.split(',').map(item => item.trim()).filter(item => item)
        : [yValueRaw];
      
      console.log(`  Valores procesados - X:`, xValues, 'Y:', yValues);

      // Procesar cada combinación X-Y
      xValues.forEach(singleXValue => {
        // Inicializar entrada para este valor X si no existe
        if (!dataMap[singleXValue]) {
          dataMap[singleXValue] = {};
        }
        
        // Contar ocurrencias para cada combinación X-Y
        yValues.forEach(singleYValue => {
          // Agregar valor Y al conjunto global
          allYValues.add(singleYValue);
          
          if (!dataMap[singleXValue][singleYValue]) {
            dataMap[singleXValue][singleYValue] = 0;
          }
          dataMap[singleXValue][singleYValue] += 1;
        });
      });
    }
  });

  console.log('Mapa de datos crudo:', dataMap);
  console.log('Todos los valores Y encontrados:', Array.from(allYValues));

  // Convertir a formato para gráfico apilado
  const result = Object.entries(dataMap).map(([xValue, yCounts]) => {
    const dataPoint: any = { 
      category: xValue,
      fullCategory: xValue 
    };
    
    // Agregar todos los valores Y (incluso los que son 0 para consistencia)
    allYValues.forEach(yValue => {
      dataPoint[yValue] = yCounts[yValue] || 0;
    });
    
    // Calcular total
    dataPoint.total = Object.values(yCounts).reduce((sum, count) => sum + count, 0);
    
    return dataPoint;
  }).sort((a, b) => b.total - a.total);

  console.log('Datos XY finales generados:', result);
  return result;
};

export const formatFieldName = (field: string): string => {
  const cleanField = field.replace(/__\d+$/, '').replace(/_/g, ' ');
  return cleanField.charAt(0).toUpperCase() + cleanField.slice(1).toLowerCase();
};