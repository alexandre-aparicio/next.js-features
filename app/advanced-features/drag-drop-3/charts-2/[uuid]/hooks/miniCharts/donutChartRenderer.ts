import { RefObject } from "react";

declare const window: any;

interface DonutChartRendererProps {
  data: any[];
  fieldName: string;
  containerId: string;
  rootRefs: RefObject<{ [key: string]: any }>;
  seriesRefs: RefObject<{ [key: string]: any }>;
  safeDispose: (chartId: string) => void;
}

export const renderMiniDonut = async ({
  data,
  fieldName,
  containerId,
  rootRefs,
  seriesRefs,
  safeDispose
}: DonutChartRendererProps): Promise<void> => {
  // Verificar que am5 esté disponible
  if (!window.am5 || !window.am5percent || !window.am5themes_Animated) {
    console.warn('amCharts no está disponible para donut chart');
    return;
  }

  const { am5, am5percent, am5themes_Animated } = window;

  // Verificar si ya existe un gráfico en este contenedor
  if (rootRefs.current[containerId]) {
    safeDispose(containerId);
    // Pequeño delay para asegurar que la limpieza se complete
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  const target = document.getElementById(containerId);
  if (!target) {
    console.warn(`Contenedor ${containerId} no encontrado para donut chart`);
    return;
  }

  // Limpiar el contenedor
  target.innerHTML = '';

  try {
    // Create root element
    const root = am5.Root.new(containerId);
    rootRefs.current[containerId] = root;

    // Set themes
    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    // Create chart with inner radius for donut hole
    const chart = root.container.children.push(am5percent.PieChart.new(root, {
      innerRadius: am5.percent(50), // ⬅⬅⬅ ESTO CREA EL AGUJERO CENTRAL
      layout: root.verticalLayout
    }));

    // Create series
    const series = chart.series.push(am5percent.PieSeries.new(root, {
      valueField: "value",
      categoryField: "category"
    }));

    // Set data
    series.data.setAll(data || []);

    // Create legend
    const legend = chart.children.push(am5.Legend.new(root, {
      centerX: am5.percent(50),
      x: am5.percent(50),
      marginTop: 10,
      marginBottom: 10,
      layout: root.horizontalLayout
    }));

    legend.data.setAll(series.dataItems);

    // Configurar leyenda para mini gráficos
    legend.labels.template.setAll({
      fontSize: 10,
      maxWidth: 60,
      textOverflow: "ellipsis"
    });

    legend.markers.template.setAll({
      width: 12,
      height: 12
    });

    series.appear(1000, 100);

    // Guardar referencias
    seriesRefs.current[containerId] = series;

    console.log(`Donut chart con agujero creado en ${containerId}`);

  } catch (error) {
    console.error('Error creando mini donut chart:', error);
    // Limpiar en caso de error
    safeDispose(containerId);
  }
};