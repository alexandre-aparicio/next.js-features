// /lib/hooks/useXYChart3.ts
import { useXYChartCommon, getSeriesNames, getColors } from './useXYChartCommon';

export function useXYChart3() {
  const { rootRef, loadAmCharts, safeDispose } = useXYChartCommon();

  const renderXYChart3 = async (data: any[], xField: string, yField: string, xFieldName: string, yFieldName: string) => {
    await loadAmCharts();

    const am5 = window.am5;
    const am5xy = window.am5xy;
    const Animated = window.am5themes_Animated;

    if (!am5 || !am5xy || !Animated) {
      console.error('amCharts no está cargado');
      return;
    }

    const target = document.getElementById("xyChart-3");
    if (!target) {
      console.error('Contenedor xyChart-3 no encontrado');
      return;
    }

    target.innerHTML = '';
    safeDispose();

    try {
      const root = am5.Root.new("xyChart-3");
      rootRef.current = root;

      root.setThemes([Animated.new(root)]);

      const chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: true,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        paddingLeft: 0,
        layout: root.verticalLayout
      }));

      // ELIMINAR o COMENTAR esta línea para quitar la barra de desplazamiento
      // chart.set("scrollbarX", am5.Scrollbar.new(root, {
      //   orientation: "horizontal"
      // }));

      const xRenderer = am5xy.AxisRendererX.new(root, {
        minGridDistance: 70,
        minorGridEnabled: true
      });

      const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {
          themeTags: ["axis"],
          animationDuration: 200
        })
      }));

      xRenderer.grid.template.setAll({ location: 1 });
      xAxis.data.setAll(data);

      const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
        min: 0,
        renderer: am5xy.AxisRendererY.new(root, {
          strokeOpacity: 0.1
        })
      }));

      const seriesNames = getSeriesNames(data);
      const colors = getColors(am5);

      console.log('Series encontradas para gráfico de barras agrupadas:', seriesNames);

      seriesNames.forEach((seriesName, index) => {
        const color = colors[index % colors.length];
        const width = index === 0 ? am5.percent(80) : am5.percent(50);
        
        const series = chart.series.push(am5xy.ColumnSeries.new(root, {
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

        series.columns.template.setAll({
          width: width,
          tooltipY: 0,
          strokeOpacity: 0,
          fill: color,
          cornerRadiusTL: 5,
          cornerRadiusTR: 5
        });

        series.data.setAll(data);
        series.appear();
      });

      chart.set("cursor", am5xy.XYCursor.new(root, {}));

      const legend = chart.children.push(am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50
      }));
      legend.data.setAll(chart.series.values);

      chart.appear(1000, 100);
      console.log('Gráfico XY-3 (Barras Agrupadas) renderizado con', seriesNames.length, 'series');

    } catch (error) {
      console.error('Error en renderXYChart3:', error);
      safeDispose();
    }
  };
  
  return {
    renderXYChart3,
    disposeXYChart3: safeDispose,
  };
}