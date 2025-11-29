// /lib/hooks/miniCharts/donutChartRenderer.ts
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
  const { am5, am5percent, am5themes_Animated } = window;
  if (!am5 || !am5percent || !am5themes_Animated) return;

  const target = document.getElementById(containerId);
  if (!target) return;
  target.innerHTML = '';

  safeDispose(containerId);

  try {
    const root = am5.Root.new(containerId);
    rootRefs.current[containerId] = root;

    root.setThemes([am5themes_Animated.new(root)]);

    // -----------------------------
    // CONTENEDOR VERTICAL EXTERNO
    // -----------------------------
    const wrapper = root.container.children.push(
      am5.Container.new(root, {
        layout: root.verticalLayout,
        width: am5.percent(100),
        height: am5.percent(100),
        paddingTop: 0,
        paddingBottom: 0
      })
    );

    // -----------------------------
    // DONUT ARRIBA
    // -----------------------------
    const chart = wrapper.children.push(
      am5percent.PieChart.new(root, {
        innerRadius: am5.percent(40),
        width: am5.percent(100),
        height: am5.percent(70) // Más espacio para la leyenda horizontal
      })
    );

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        name: fieldName,
        valueField: "value",
        categoryField: "category"
      })
    );

    // Etiquetas de porcentaje con líneas
    series.labels.template.setAll({
      text: "{valuePercentTotal.formatNumber('#.0')}%",
      fontSize: 10,
      inside: false,
      radius: 10
    });

    series.ticks.template.setAll({
      strokeWidth: 1,
      strokeOpacity: 0.6
    });

    series.data.setAll(data || []);
    seriesRefs.current[containerId] = series;

    // -----------------------------
    // LEYENDA HORIZONTAL ABAJO
    // -----------------------------
    const legend = wrapper.children.push(
      am5.Legend.new(root, {
        width: am5.percent(100),
        height: am5.percent(30),
        centerX: am5.percent(50),
        x: am5.percent(50),
        marginTop: 5,
        marginBottom: 0,
        layout: root.horizontalLayout, // Layout horizontal
        maxColumns: 3, // Máximo de columnas
        centerGrid: true // Centrar los elementos
      })
    );

    // Configurar los marcadores (cuadrados)
    legend.markers.template.setAll({
      width: 12,
      height: 12,
      marginRight: 5,
      marginLeft: 0
    });

    // Configurar los labels
    legend.labels.template.setAll({
      fontSize: 9,
      text: "{category}",
      maxWidth: 60,
      textOverflow: "ellipsis"
    });

    // Configurar los valores
    legend.valueLabels.template.setAll({
      fontSize: 9,
      text: "{value}",
      marginLeft: 3
    });

    // Aplicar layout horizontal forzado
    legend.itemContainers.template.setAll({
      maxWidth: 80,
      marginRight: 5,
      marginLeft: 0
    });

    legend.data.setAll(series.dataItems);

    series.appear(500, 80);
    chart.appear(500, 80);
  } catch (error) {
    console.error("Error mini-donut:", error);
  }
};