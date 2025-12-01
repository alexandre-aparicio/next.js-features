// /lib/hooks/miniCharts/XyCharts/XyChart3Renderer.ts
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

// Función para generar datos XY dinámicamente para gráfico de barras agrupadas
const generateDynamicGroupedData = (responses: any[], xField: string, yField: string): any => {
  const dataMap: Record<string, Record<string, number>> = {};
  const allYValues = new Set<string>();
  
  console.log('Generando datos dinámicos para gráfico agrupado:', { xField, yField, totalResponses: responses.length });

  responses.forEach((response, index) => {
    if (!response || !response.responses) {
      console.warn(`Respuesta ${index} no tiene objeto responses`);
      return;
    }

    const xValue = response.responses[xField];
    const yValueRaw = response.responses[yField];
    
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

  if (Object.keys(dataMap).length === 0) {
    console.warn('No se encontraron datos válidos para generar el gráfico agrupado');
    return { data: [], series: [] };
  }

  const result = Object.entries(dataMap).map(([xValue, yCounts]) => {
    const dataPoint: any = { category: xValue };
    
    allYValues.forEach(yValue => {
      dataPoint[yValue] = yCounts[yValue] || 0;
    });
    
    dataPoint.total = Object.values(yCounts).reduce((sum, count) => sum + count, 0);
    return dataPoint;
  });

  console.log('Datos dinámicos para gráfico agrupado:', { 
    data: result, 
    series: Array.from(allYValues) 
  });
  
  return { data: result, series: Array.from(allYValues) };
};

// Función para obtener colores
const getColors = (am5: any) => {
  return [
    am5.color("#3B82F6"), // Azul
    am5.color("#EC4899"), // Rosa
    am5.color("#10B981"), // Verde
    am5.color("#F59E0B"), // Amarillo
    am5.color("#8B5CF6"), // Púrpura
    am5.color("#EF4444"), // Rojo
    am5.color("#06B6D4"), // Cian
    am5.color("#84CC16"), // Verde lima
  ];
};

export const renderMiniXYChart3 = async ({
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
    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      console.warn('No hay respuestas válidas para generar el gráfico agrupado');
      const noDataMessage = document.createElement('div');
      noDataMessage.className = 'flex items-center justify-center h-full text-gray-500 text-xs';
      noDataMessage.textContent = 'No hay datos para mostrar';
      target.appendChild(noDataMessage);
      return;
    }

    const { data, series } = generateDynamicGroupedData(responses, xField, yField);
    
    if (data.length === 0 || series.length === 0) {
      console.warn('No hay datos suficientes para generar el gráfico agrupado');
      const noDataMessage = document.createElement('div');
      noDataMessage.className = 'flex items-center justify-center h-full text-gray-500 text-xs';
      noDataMessage.textContent = 'No hay datos para mostrar';
      target.appendChild(noDataMessage);
      return;
    }

    const root = am5.Root.new(containerId);
    rootRefs.current[containerId] = root;
    
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "none",
      wheelY: "none",
      paddingLeft: 0,
      paddingRight: 5,
      paddingTop: 5,
      paddingBottom: 5,
      width: am5.percent(100),
      height: am5.percent(100)
    }));

    const xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 30
    });

    const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      categoryField: "category",
      renderer: xRenderer,
      tooltip: am5.Tooltip.new(root, {})
    }));

    xAxis.data.setAll(data);

    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      min: 0,
      renderer: am5xy.AxisRendererY.new(root, {
        strokeOpacity: 0.1
      })
    }));

    const colors = getColors(am5);
    const seriesList: any[] = [];

    console.log('Series encontradas para gráfico agrupado:', series);

    series.forEach((seriesName: any, index: any) => {
      const color = colors[index % colors.length];
      const width = am5.percent(60);
      
      const seriesItem = chart.series.push(am5xy.ColumnSeries.new(root, {
        name: seriesName,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: seriesName,
        categoryXField: "category",
        clustered: false,
        tooltip: am5.Tooltip.new(root, {
          labelText: `${seriesName}: {valueY}`
        })
      }));

      seriesItem.columns.template.setAll({
        width: width,
        tooltipY: 0,
        strokeOpacity: 0,
        fill: color,
        cornerRadiusTL: 3,
        cornerRadiusTR: 3
      });

      seriesItem.data.setAll(data);
      seriesList.push(seriesItem);
    });

    chart.set("cursor", am5xy.XYCursor.new(root, {}));

    const legend = chart.children.push(am5.Legend.new(root, {
      centerX: am5.p50,
      x: am5.p50
    }));
    legend.data.setAll(chart.series.values);

    seriesRefs.current[containerId] = seriesList;

    seriesList.forEach(seriesItem => seriesItem.appear(300));
    chart.appear(300, 100);

    console.log(`Gráfico agrupado creado en ${containerId} con ${series.length} series`);

  } catch (error) {
    console.error('Error creando gráfico agrupado:', error);
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