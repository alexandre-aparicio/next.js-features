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
    // DONUT MÁS GRANDE
    // -----------------------------
    const chart = wrapper.children.push(
      am5percent.PieChart.new(root, {
        innerRadius: am5.percent(30),
        width: am5.percent(100),
        height: am5.percent(80)
      })
    );

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        name: fieldName,
        valueField: "value",
        categoryField: "category"
      })
    );

    // Etiquetas de porcentaje
    series.labels.template.setAll({
      text: "{valuePercentTotal.formatNumber('#.0')}%",
      fontSize: 12,
      inside: false,
      radius: 15,
      fill: am5.color(0x000000)
    });

    // Líneas de conexión
    series.ticks.template.setAll({
      strokeWidth: 1,
      strokeOpacity: 0.6,
      length: 8
    });

    series.data.setAll(data || []);
    seriesRefs.current[containerId] = series;

    // -----------------------------
    // LEYENDA EN LA PARTE INFERIOR
    // -----------------------------
    const legendContainer = wrapper.children.push(
      am5.Container.new(root, {
        width: am5.percent(100),
        layout: root.horizontalLayout,
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0
      })
    );

    const legend = legendContainer.children.push(
      am5.Legend.new(root, {
        width: am5.percent(100),
        layout: root.horizontalLayout,
        centerX: am5.percent(50), 
        x: am5.percent(50),
        contentAlign: "center",
        maxColumns: data.length,
      })
    );

    // Marcadores
    legend.markers.template.setAll({
      width: 14,
      height: 14,
      marginRight: 8
    });

    // Labels
    legend.labels.template.setAll({
      fontSize: 11,
      text: "{category}",
      textAlign: "center",
      maxWidth: 70,
      textOverflow: "ellipsis"
    });

    // Valores - muestra el valor absoluto usando un adaptador
    legend.valueLabels.template.setAll({
      fontSize: 11,
      textAlign: "center",
      marginLeft: 5
    });

    legend.valueLabels.template.adapters.add("text", function(text: any, target: any) {
      const dataItem = target.dataItem;
      if (dataItem && dataItem.dataContext) {
        return String(dataItem.dataContext.value);
      }
      return text;
    });

    legend.itemContainers.template.setAll({
      centerX: am5.percent(50),
      centerY: am5.percent(50),
      layout: root.horizontalLayout
    });

    legend.data.setAll(series.dataItems);

    series.appear(500, 100);
    chart.appear(500, 100);
  } catch (error) {
    console.error("Error mini-donut:", error);
  }
};