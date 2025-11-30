import { RefObject } from "react";

declare const window: any;

interface BarChartRendererProps {
  data: any[];
  fieldName: string;
  containerId: string;
  rootRefs: RefObject<{ [key: string]: any }>;
  seriesRefs: RefObject<{ [key: string]: any }>;
  safeDispose: (chartId: string) => void;
}

export const renderMiniBars = async ({
  data,
  fieldName,
  containerId,
  rootRefs,
  seriesRefs,
  safeDispose
}: BarChartRendererProps): Promise<void> => {
  // Verificar que am5 esté disponible
  if (!window.am5 || !window.am5xy || !window.am5themes_Animated) {
    console.warn('amCharts no está disponible');
    return;
  }

  const { am5, am5xy, am5themes_Animated } = window;

  // Verificar si ya existe un gráfico en este contenedor
  if (rootRefs.current[containerId]) {
    safeDispose(containerId);
    // Pequeño delay para asegurar que la limpieza se complete
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  const target = document.getElementById(containerId);
  if (!target) {
    console.warn(`Contenedor ${containerId} no encontrado`);
    return;
  }

  // Limpiar el contenedor
  target.innerHTML = '';

  try {
    // Crear nueva raíz
    const root = am5.Root.new(containerId);
    rootRefs.current[containerId] = root;
    
    // Configurar tema
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

    // -----------------------------
    // X AXIS — labels abajo
    // -----------------------------
    const xRenderer = am5xy.AxisRendererX.new(root, { 
      minGridDistance: 20,
      inside: false
    });

    xRenderer.grid.template.setAll({ visible: false });

    xRenderer.labels.template.setAll({ 
      fontSize: 11,
      maxWidth: 30,
      textOverflow: "ellipsis",
      inside: false, 
      centerY: am5.p0,
      location: 0.5
    });

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, { 
        categoryField: "category", 
        renderer: xRenderer 
      })
    );
    xAxis.data.setAll(data || []);

    // -----------------------------
    // Y AXIS
    // -----------------------------
    const yRenderer = am5xy.AxisRendererY.new(root, { inside: true });
    yRenderer.grid.template.setAll({ visible: false });
    yRenderer.labels.template.setAll({ fontSize: 8, inside: true });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, { 
        min: 0, 
        renderer: yRenderer 
      })
    );

    // -----------------------------
    // SERIES
    // -----------------------------
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: fieldName,
        xAxis,
        yAxis,
        valueYField: "value",
        categoryXField: "category",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{categoryX}: {valueY}",  
          pointerOrientation: "vertical"
        })
      })
    );

    series.set("interactive", true);

    series.columns.template.setAll({ 
      width: am5.percent(50), 
      cornerRadiusTL: 2, 
      cornerRadiusTR: 2, 
      strokeOpacity: 0,
      interactive: true,  
      tooltipText: "{categoryX}: {valueY}"    
    });
    
    series.data.setAll(data || []);
    seriesRefs.current[containerId] = series;

    // Animaciones
    series.appear(300);
    chart.appear(300);

    console.log(`Gráfico de barras creado en ${containerId}`);

  } catch (error) {
    console.error('Error creando mini-bar chart:', error);
    // Limpiar en caso de error
    safeDispose(containerId);
  }
};