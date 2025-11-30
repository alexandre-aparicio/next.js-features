import { ChartData, FormResponse } from '../types/types';

// Función auxiliar para obtener el valor de un campo de las respuestas organizadas por páginas
const getFieldValue = (responses: any, field: string): string | null => {
  if (!responses) return null;
  
  // Buscar el campo en todas las páginas
  for (const pageName in responses) {
    if (responses[pageName] && responses[pageName][field] !== undefined && responses[pageName][field] !== null) {
      const value = responses[pageName][field];
      if (typeof value === 'string' && value.trim() !== '') {
        return value;
      } else if (Array.isArray(value) && value.length > 0) {
        return value.join(', ');
      }
    }
  }
  return null;
};

export const generateChartData = (
  responses: FormResponse[], 
  field: string, 
  maxLength?: number
): ChartData[] => {
  const counts: Record<string, number> = {};
  let total = 0;

  responses.forEach((r) => {
    // Usar la nueva función para obtener el valor del campo
    const value = getFieldValue(r.responses, field);
    
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
    // Usar la nueva función para obtener valores de campos
    const xValue = getFieldValue(response.responses, xField);
    const yValueRaw = getFieldValue(response.responses, yField);
    
    console.log(`Respuesta ${index}:`, { xValue, yValueRaw });

    if (xValue?.trim() && yValueRaw?.trim()) {
      // Separar valores X si hay comas
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

// Nueva función para obtener todas las páginas disponibles
export const getAvailablePages = (responses: FormResponse[]): string[] => {
  const pages = new Set<string>();
  
  responses.forEach(response => {
    if (response.responses) {
      Object.keys(response.responses).forEach(pageName => {
        pages.add(pageName);
      });
    }
  });
  
  return Array.from(pages).sort();
};

// Nueva función para obtener campos por página
export const getFieldsByPage = (responses: FormResponse[], pageName?: string): string[] => {
  const fields = new Set<string>();
  
  responses.forEach(response => {
    if (response.responses) {
      if (pageName) {
        // Campos de una página específica
        if (response.responses[pageName]) {
          Object.keys(response.responses[pageName]).forEach(field => {
            fields.add(field);
          });
        }
      } else {
        // Todos los campos de todas las páginas
        Object.values(response.responses).forEach(pageFields => {
          Object.keys(pageFields).forEach(field => {
            fields.add(field);
          });
        });
      }
    }
  });
  
  return Array.from(fields).sort();
};

export const formatFieldName = (field: string): string => {
  const cleanField = field.replace(/__\d+$/, '').replace(/_/g, ' ');
  return cleanField.charAt(0).toUpperCase() + cleanField.slice(1).toLowerCase();
};

// Nueva función para formatear nombres de página
export const formatPageName = (pageName: string): string => {
  return pageName.charAt(0).toUpperCase() + pageName.slice(1).toLowerCase();
};