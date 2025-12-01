import { RefObject } from "react";

declare const window: any;

interface XYChartRendererProps {
  responses: any[];
  xField: string;
  yField: string;
  xFieldName: string;
  yFieldName: string;
  containerId: string;
  rootRefs: RefObject<{ [key: string]: any }>;
  seriesRefs: RefObject<{ [key: string]: any }>;
  safeDispose: (chartId: string) => void;
}

// Función para generar datos XY dinámicamente
const generateDynamicXYData = (responses: any[], xField: string, yField: string): any => {
  const dataMap: Record<string, Record<string, number>> = {};
  const allYValues = new Set<string>();
  
  console.log('Generando datos dinámicos para mini chart:', { xField, yField, totalResponses: responses.length });

  responses.forEach((response, index) => {
    // Verificar que la respuesta tenga el objeto responses y los campos existan
    if (!response || !response.responses) {
      console.warn(`Respuesta ${index} no tiene objeto responses`);
      return;
    }

    const xValue = response.responses[xField];
    const yValueRaw = response.responses[yField];
    
    console.log(`Respuesta ${index}:`, { 
      xValue, 
      yValueRaw,
      xField,
      yField,
      availableFields: Object.keys(response.responses) // Mostrar campos disponibles
    });

    // Verificar que ambos campos tengan valores
    if (!xValue || !yValueRaw) {
      console.log(`  Campos incompletos - X: ${xValue}, Y: ${yValueRaw}`);
      return;
    }

    const xValueStr = String(xValue).trim();
    const yValueStr = String(yValueRaw).trim();

    if (!xValueStr || !yValueStr) {
      console.log(`  Campos vacíos después de trim - X: "${xValueStr}", Y: "${yValueStr}"`);
      return;
    }

    // Separar valores X si hay comas
    const xValues = xValueStr.includes(',') 
      ? xValueStr.split(',').map(item => item.trim()).filter(item => item)
      : [xValueStr];
    
    // Separar valores Y si hay comas
    const yValues = yValueStr.includes(',') 
      ? yValueStr.split(',').map(item => item.trim()).filter(item => item)
      : [yValueStr];
    
    console.log(`  Valores procesados - X:`, xValues, 'Y:', yValues);

    // Procesar cada combinación X-Y
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
  });

  console.log('Mapa de datos crudo:', dataMap);
  console.log('Todos los valores Y encontrados:', Array.from(allYValues));

  // Si no hay datos, retornar estructura vacía
  if (Object.keys(dataMap).length === 0) {
    console.warn('No se encontraron datos válidos para generar el gráfico');
    return { data: [], series: [] };
  }

  const result = Object.entries(dataMap).map(([xValue, yCounts]) => {
    const dataPoint: any = { category: xValue };
    
    // Agregar todos los valores Y (incluso los que son 0 para consistencia)
    allYValues.forEach(yValue => {
      dataPoint[yValue] = yCounts[yValue] || 0;
    });
    
    dataPoint.total = Object.values(yCounts).reduce((sum, count) => sum + count, 0);
    return dataPoint;
  }).sort((a, b) => b.total - a.total);

  console.log('Datos dinámicos para mini chart:', { 
    data: result, 
    series: Array.from(allYValues) 
  });
  
  return { data: result, series: Array.from(allYValues) };
};

export const renderMiniXYChart = async ({
  responses,
  xField,
  yField,
  xFieldName,
  yFieldName,
  containerId,
  rootRefs,
  seriesRefs,
  safeDispose
}: XYChartRendererProps): Promise<void> => {
  if (!window.am5 || !window.am5xy || !window.am5themes_Animated) {
    console.warn('amCharts no está disponible');
    return;
  }

  const { am5, am5xy, am5themes_Animated } = window;

  if (rootRefs.current[containerId]) {
    safeDispose(containerId);
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  const target = document.getElementById(containerId);
  if (!target) {
    console.warn(`Contenedor ${containerId} no encontrado`);
    return;
  }

  target.innerHTML = '';

  try {
    // Verificar que tenemos respuestas válidas
    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      console.warn('No hay respuestas válidas para generar el gráfico');
      const noDataMessage = document.createElement('div');
      noDataMessage.className = 'flex items-center justify-center h-full text-gray-500 text-xs';
      noDataMessage.textContent = 'No hay datos para mostrar';
      target.appendChild(noDataMessage);
      return;
    }

    // Generar datos dinámicamente
    const { data, series } = generateDynamicXYData(responses, xField, yField);
    
    if (data.length === 0 || series.length === 0) {
      console.warn('No hay datos suficientes para generar el gráfico XY');
      const noDataMessage = document.createElement('div');
      noDataMessage.className = 'flex items-center justify-center h-full text-gray-500 text-xs';
      noDataMessage.textContent = 'No hay datos para mostrar';
      target.appendChild(noDataMessage);
      return;
    }

    const root = am5.Root.new(containerId);
    rootRefs.current[containerId] = root;
    
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        paddingLeft: 5,
        paddingRight: 5,
        paddingTop: 5,
        paddingBottom: 5,
        width: am5.percent(100),
        height: am5.percent(100)
      })
    );

    // Eje X - Valores del primer campo
    const xRenderer = am5xy.AxisRendererX.new(root, { 
      minGridDistance: 20,
      inside: false
    });

    xRenderer.grid.template.setAll({ visible: false });
    xRenderer.labels.template.setAll({ 
      fontSize: 8,
      maxWidth: 30,
      textOverflow: "ellipsis",
      inside: false,
      rotation: -45
    });

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, { 
        categoryField: "category", 
        renderer: xRenderer 
      })
    );
    xAxis.data.setAll(data);

    // Eje Y - Valores
    const yRenderer = am5xy.AxisRendererY.new(root, { inside: true });
    yRenderer.grid.template.setAll({ visible: false });
    yRenderer.labels.template.setAll({ fontSize: 8, inside: true });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, { 
        min: 0, 
        renderer: yRenderer 
      })
    );

    // Colores para las series
    const colors = [
      am5.color("#3B82F6"), // Azul
      am5.color("#EC4899"), // Rosa
      am5.color("#10B981"), // Verde
      am5.color("#F59E0B"), // Amarillo
      am5.color("#8B5CF6"), // Púrpura
      am5.color("#EF4444"), // Rojo
      am5.color("#06B6D4"), // Cian
      am5.color("#84CC16"), // Verde lima
    ];

    const seriesList: any[] = [];

    series.forEach((seriesName: any, index: any) => {
      const color = colors[index % colors.length];
      
      const seriesItem = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: seriesName,
          stacked: true,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: seriesName,
          categoryXField: "category",
          tooltip: am5.Tooltip.new(root, {
            labelText: `${seriesName}: {valueY}`,  
            pointerOrientation: "vertical"
          })
        })
      );

      seriesItem.columns.template.setAll({ 
        width: am5.percent(60), 
        cornerRadiusTL: 2, 
        cornerRadiusTR: 2, 
        strokeOpacity: 0,
        fill: color,
        fillOpacity: 0.8,
        interactive: true
      });

      seriesItem.data.setAll(data);
      seriesList.push(seriesItem);
    });

    seriesRefs.current[containerId] = seriesList;

    seriesList.forEach(seriesItem => seriesItem.appear(300));
    chart.appear(300);

    console.log(`Mini gráfico XY dinámico creado en ${containerId} con ${series.length} series`);

  } catch (error) {
    console.error('Error creando mini XY chart dinámico:', error);
    safeDispose(containerId);

    const target = document.getElementById(containerId);
    if (target) {
      const errorMessage = document.createElement('div');
      errorMessage.className = 'flex items-center justify-center h-full text-red-500 text-xs';
      errorMessage.textContent = 'Error al cargar el gráfico';
      target.appendChild(errorMessage);
    }
  }
};