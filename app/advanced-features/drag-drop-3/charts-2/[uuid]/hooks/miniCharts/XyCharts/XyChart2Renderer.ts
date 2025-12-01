import { RefObject } from "react";

declare const window: any;

interface XYChartRenderer2Props {
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

const generateDynamicRadarData = (responses: any[], xField: string, yField: string): any => {
  const dataMap: Record<string, Record<string, number>> = {};
  const allYValues = new Set<string>();
  
  console.log('Generando datos dinámicos para gráfico radar:', { xField, yField, totalResponses: responses.length });

  responses.forEach((response, index) => {
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
      availableFields: Object.keys(response.responses)
    });

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
    console.warn('No se encontraron datos válidos para generar el gráfico radar');
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

  console.log('Datos dinámicos para gráfico radar:', { 
    data: result, 
    series: Array.from(allYValues) 
  });
  
  return { data: result, series: Array.from(allYValues) };
};

// Función para obtener colores pastel
const getPastelColors = (am5: any) => {
  return [
    am5.color("#A7C7E7"), // Azul pastel
    am5.color("#F8C8DC"), // Rosa pastel
    am5.color("#C1E1C1"), // Verde pastel
    am5.color("#FFD8A8"), // Naranja pastel
    am5.color("#D8BFD8"), // Lavanda pastel
    am5.color("#FFB6C1"), // Rosa claro pastel
    am5.color("#B5EAD7"), // Menta pastel
    am5.color("#E2F0CB"), // Lima pastel
  ];
};

export const renderMiniXYChart2 = async ({
  responses,
  xField,
  yField,
  xFieldName,
  yFieldName,
  containerId,
  rootRefs,
  seriesRefs,
  safeDispose
}: XYChartRenderer2Props): Promise<void> => {
  // Cargar módulo radar si no está disponible
  if (!window.am5radar) {
    const script = document.createElement('script');
    script.src = "https://cdn.amcharts.com/lib/5/radar.js";
    script.async = true;
    document.head.appendChild(script);
    
    await new Promise((resolve) => {
      script.onload = resolve;
    });
  }

  if (!window.am5 || !window.am5xy || !window.am5radar || !window.am5themes_Animated) {
    console.warn('amCharts no está disponible');
    return;
  }

  const { am5, am5xy, am5radar, am5themes_Animated } = window;

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
      console.warn('No hay respuestas válidas para generar el gráfico radar');
      const noDataMessage = document.createElement('div');
      noDataMessage.className = 'flex items-center justify-center h-full text-gray-500 text-xs';
      noDataMessage.textContent = 'No hay datos para mostrar';
      target.appendChild(noDataMessage);
      return;
    }

    // Generar datos dinámicamente
    const { data, series } = generateDynamicRadarData(responses, xField, yField);
    
    if (data.length === 0 || series.length === 0) {
      console.warn('No hay datos suficientes para generar el gráfico radar');
      const noDataMessage = document.createElement('div');
      noDataMessage.className = 'flex items-center justify-center h-full text-gray-500 text-xs';
      noDataMessage.textContent = 'No hay datos para mostrar';
      target.appendChild(noDataMessage);
      return;
    }

    const root = am5.Root.new(containerId);
    rootRefs.current[containerId] = root;
    
    root.setThemes([am5themes_Animated.new(root)]);

    // Configuración del chart sin interacción de rueda del mouse
    const chart = root.container.children.push(am5radar.RadarChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "none",
      wheelY: "none",
      width: am5.percent(100),
      height: am5.percent(100)
    }));

    // Configurar el cursor sin comportamiento de zoom
    const cursor = chart.set("cursor", am5radar.RadarCursor.new(root, {
      behavior: "none"
    }));
    cursor.lineY.set("visible", false);
    cursor.lineX.set("visible", false);

    const xRenderer = am5radar.AxisRendererCircular.new(root, {});
    xRenderer.labels.template.setAll({ 
      radius: 10,
      fontSize: 8 
    });

    const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      maxDeviation: 0,
      categoryField: "category",
      renderer: xRenderer,
      tooltip: am5.Tooltip.new(root, {})
    }));

    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5radar.AxisRendererRadial.new(root, {})
    }));

    const colors = getPastelColors(am5);
    const seriesList: any[] = [];

    console.log('Series encontradas para gráfico radar:', series);

    series.forEach((seriesName: any, index: any) => {
      const color = colors[index % colors.length];
      
      const seriesItem = chart.series.push(am5radar.RadarColumnSeries.new(root, {
        stacked: true,
        name: seriesName,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: seriesName,
        categoryXField: "category",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{name}: {valueY}"
        })
      }));

      seriesItem.columns.template.setAll({
        tooltipText: "{name}: {valueY}",
        fill: color,
        strokeOpacity: 0,
        cornerRadius: 3,
        width: am5.percent(60)
      });

      seriesItem.data.setAll(data);
      seriesList.push(seriesItem);
    });

    seriesRefs.current[containerId] = seriesList;

    xAxis.data.setAll(data);
    
    seriesList.forEach(seriesItem => seriesItem.appear(300));
    chart.appear(300, 100);

    console.log(`Gráfico radar creado en ${containerId} con ${series.length} series`);

  } catch (error) {
    console.error('Error creando gráfico radar:', error);
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