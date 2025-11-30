import { ChartData, FormResponse } from '../types/types';

export const generateChartData = (
  responses: FormResponse[], 
  field: string, 
  maxLength?: number
): ChartData[] => {
  const counts: Record<string, number> = {};
  let total = 0;

  responses.forEach((r) => {
    let value: string | undefined;

    // Verificar si la respuesta tiene estructura de páginas
    const hasPages = Object.keys(r.responses).some(key => 
      key.toLowerCase().includes('página') || key.toLowerCase().includes('page')
    );

    if (hasPages) {
      // Estructura con páginas: buscar el campo en todas las páginas
      Object.keys(r.responses).forEach(pageKey => {
        const page = r.responses[pageKey];
        if (page && typeof page === 'object' && page[field]) {
          value = page[field];
        }
      });
    } else {
      // Estructura plana: buscar directamente en responses
      value = r.responses[field];
    }
    
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

  console.log(`Datos generados para campo ${field}:`, counts);
  console.log(`Total de respuestas con datos: ${total}`);

  const result = Object.entries(counts)
    .map(([category, value]) => ({
      category: formatValue(maxLength && category.length > maxLength ? 
        category.substring(0, maxLength) + '...' : category),
      fullCategory: formatValue(category),
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
  const dataMap: Record<string, Record<string, number>> = {};
  const allYValues = new Set<string>();
  
  console.log('Generando datos XY para:', { xField, yField, totalRespuestas: responses.length });

  responses.forEach((response, index) => {
    let xValue: string | undefined;
    let yValueRaw: string | undefined;

    // Verificar si la respuesta tiene estructura de páginas
    const hasPages = Object.keys(response.responses).some(key => 
      key.toLowerCase().includes('página') || key.toLowerCase().includes('page')
    );

    if (hasPages) {
      // Estructura con páginas
      Object.keys(response.responses).forEach(pageKey => {
        const page = response.responses[pageKey];
        if (page && typeof page === 'object') {
          if (page[xField]) xValue = page[xField];
          if (page[yField]) yValueRaw = page[yField];
        }
      });
    } else {
      // Estructura plana
      xValue = response.responses[xField];
      yValueRaw = response.responses[yField];
    }

    console.log(`Respuesta ${index}:`, { xValue, yValueRaw, hasPages });

    if (xValue?.trim() && yValueRaw?.trim()) {
      const xValues = xValue.includes(',') 
        ? xValue.split(',').map(item => item.trim()).filter(item => item)
        : [xValue];
      
      const yValues = yValueRaw.includes(',') 
        ? yValueRaw.split(',').map(item => item.trim()).filter(item => item)
        : [yValueRaw];
      
      console.log(`  Valores procesados - X:`, xValues, 'Y:', yValues);

      xValues.forEach(singleXValue => {
        if (!dataMap[singleXValue]) {
          dataMap[singleXValue] = {};
        }
        
        yValues.forEach(singleYValue => {
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
    const formattedXValue = formatValue(xValue);
    const dataPoint: any = { 
      category: formattedXValue,
      fullCategory: formattedXValue
    };
    
    // Agregar todos los valores Y formateados
    allYValues.forEach(yValue => {
      const formattedYValue = formatValue(yValue);
      dataPoint[formattedYValue] = yCounts[yValue] || 0;
    });
    
    // Calcular total
    dataPoint.total = Object.values(yCounts).reduce((sum, count) => sum + count, 0);
    
    return dataPoint;
  }).sort((a, b) => b.total - a.total);

  console.log('Datos XY finales generados:', result);
  return result;
};

// Función SOLO para nombres de campos (quita __4599 y cambia _ por espacios)
export const formatFieldName = (field: string): string => {
  const cleanField = field.replace(/__\d+$/, '').replace(/_/g, ' ');
  return cleanField.charAt(0).toUpperCase() + cleanField.slice(1);
};

// Función para formatear valores de datos (mantiene mayúsculas/minúsculas originales, cambia _ por espacios)
export const formatValue = (value: string): string => {
  return value.replace(/_/g, ' '); // Solo cambia guiones bajos por espacios
};

// Función para obtener todos los campos únicos
export const getAllFormFields = (responses: FormResponse[]): string[] => {
  const allFields = new Set<string>();
  
  if (!responses || responses.length === 0) {
    return [];
  }

  responses.forEach(response => {
    // Verificar si tiene estructura de páginas
    const hasPages = Object.keys(response.responses).some(key => 
      key.toLowerCase().includes('página') || key.toLowerCase().includes('page')
    );

    if (hasPages) {
      // Estructura con páginas
      Object.keys(response.responses).forEach(pageKey => {
        const page = response.responses[pageKey];
        if (page && typeof page === 'object') {
          Object.keys(page).forEach(field => {
            // Solo agregar campos que no parezcan nombres de página
            if (!field.toLowerCase().includes('página') && !field.toLowerCase().includes('page')) {
              allFields.add(field);
            }
          });
        }
      });
    } else {
      // Estructura plana
      Object.keys(response.responses).forEach(field => {
        allFields.add(field);
      });
    }
  });
  
  return Array.from(allFields);
};

// Función para obtener campos organizados por página
export const getFieldsByPage = (responses: FormResponse[]): { [pageName: string]: string[] } => {
  const fieldsByPage: { [pageName: string]: string[] } = { 'all': [] };
  const allFieldsSet = new Set<string>();
  
  if (!responses || responses.length === 0) {
    return fieldsByPage;
  }

  // Procesar todas las respuestas para detectar la estructura
  responses.forEach(response => {
    const hasPages = Object.keys(response.responses).some(key => 
      key.toLowerCase().includes('página') || key.toLowerCase().includes('page')
    );

    if (hasPages) {
      // Estructura con páginas
      Object.keys(response.responses).forEach(pageKey => {
        const page = response.responses[pageKey];
        if (page && typeof page === 'object') {
          if (!fieldsByPage[pageKey]) {
            fieldsByPage[pageKey] = [];
          }
          
          Object.keys(page).forEach(field => {
            if (!fieldsByPage[pageKey].includes(field)) {
              fieldsByPage[pageKey].push(field);
            }
            allFieldsSet.add(field);
          });
        }
      });
    } else {
      // Estructura plana - tratar como "Página Única"
      if (!fieldsByPage['Única']) {
        fieldsByPage['Única'] = [];
      }
      
      Object.keys(response.responses).forEach(field => {
        if (!fieldsByPage['Única'].includes(field)) {
          fieldsByPage['Única'].push(field);
        }
        allFieldsSet.add(field);
      });
    }
  });

  fieldsByPage['all'] = Array.from(allFieldsSet);
  return fieldsByPage;
};

// Función para obtener nombres de páginas
export const getPageNames = (responses: FormResponse[]): string[] => {
  if (!responses || responses.length === 0) {
    return ['all'];
  }

  const pageNames = new Set<string>(['all']);
  
  // Verificar si la primera respuesta tiene páginas
  const firstResponse = responses[0];
  const hasPages = Object.keys(firstResponse.responses).some(key => 
    key.toLowerCase().includes('página') || key.toLowerCase().includes('page')
  );

  if (hasPages) {
    responses.forEach(response => {
      Object.keys(response.responses).forEach(pageKey => {
        pageNames.add(pageKey);
      });
    });
  } else {
    pageNames.add('Única');
  }

  return Array.from(pageNames);
};

// Función para formatear nombres de página
export const formatPageName = (pageKey: string): string => {
  if (pageKey === 'all') return 'Todos';
  if (pageKey === 'Única') return 'Página Única';
  
  return pageKey
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace('Pagina', 'Página')
    .replace('Página', 'Página ');
};

// Función para obtener el valor de un campo
export const getFieldValue = (response: FormResponse, field: string): string | undefined => {
  let value: string | undefined;
  
  const hasPages = Object.keys(response.responses).some(key => 
    key.toLowerCase().includes('página') || key.toLowerCase().includes('page')
  );

  if (hasPages) {
    Object.keys(response.responses).forEach(pageKey => {
      const page = response.responses[pageKey];
      if (page && page[field]) {
        value = page[field];
      }
    });
  } else {
    value = response.responses[field];
  }
  
  return value;
};