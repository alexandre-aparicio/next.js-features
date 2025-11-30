// /lib/hooks/useXYChart2.ts
import { useXYChartCommon, getSeriesNames, getPastelColors } from './useXYChartCommon';

export function useXYChart2() {
  const { rootRef, loadAmCharts, safeDispose } = useXYChartCommon();

  const renderXYChart2 = async (data: any[], xField: string, yField: string, xFieldName: string, yFieldName: string) => {
    await loadAmCharts([{ src: "https://cdn.amcharts.com/lib/5/radar.js", key: "am5radar" }]);

    // Ahora TypeScript reconoce estas propiedades en window
    const am5 = window.am5;
    const am5xy = window.am5xy;
    const am5radar = window.am5radar;
    const Animated = window.am5themes_Animated;

    if (!am5 || !am5xy || !am5radar || !Animated) {
      console.error('amCharts no está cargado');
      return;
    }

    const target = document.getElementById("xyChart-2");
    if (!target) {
      console.error('Contenedor xyChart-2 no encontrado');
      return;
    }

    target.innerHTML = '';
    safeDispose();

    try {
      const root = am5.Root.new("xyChart-2");
      rootRef.current = root;

      root.setThemes([Animated.new(root)]);

      // Configuración del chart sin interacción de rueda del mouse
      const chart = root.container.children.push(am5radar.RadarChart.new(root, {
        panX: false,
        panY: false,
        // Eliminar la configuración de wheelX y wheelY para deshabilitar el scroll
        wheelX: "none",
        wheelY: "none"
      }));

      // Configurar el cursor sin comportamiento de zoom
      const cursor = chart.set("cursor", am5radar.RadarCursor.new(root, {
        behavior: "none" // Deshabilitar completamente el comportamiento del cursor
      }));
      cursor.lineY.set("visible", false);
      cursor.lineX.set("visible", false);

      const xRenderer = am5radar.AxisRendererCircular.new(root, {});
      xRenderer.labels.template.setAll({ radius: 10 });

      const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
        maxDeviation: 0,
        categoryField: "category",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {})
      }));

      const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
        renderer: am5radar.AxisRendererRadial.new(root, {})
      }));

      const seriesNames = getSeriesNames(data);
      const colors = getPastelColors(am5);

      console.log('Series encontradas para gráfico radar:', seriesNames);

      seriesNames.forEach((seriesName, index) => {
        const color = colors[index % colors.length];
        
        const series = chart.series.push(am5radar.RadarColumnSeries.new(root, {
          stacked: true,
          name: seriesName,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: seriesName,
          categoryXField: "category"
        }));

        series.columns.template.setAll({
          tooltipText: "{name}: {valueY}",
          fill: color,
          strokeOpacity: 0,
          cornerRadius: 5,
          width: am5.percent(80)
        });

        series.data.setAll(data);
        series.appear(1000);
      });

      xAxis.data.setAll(data);
      chart.appear(1000, 100);

      console.log('Gráfico XY-2 (Radar) renderizado con', seriesNames.length, 'series');

    } catch (error) {
      console.error('Error en renderXYChart2:', error);
      safeDispose();
    }
  };

  return {
    renderXYChart2,
    disposeXYChart2: safeDispose,
  };
}