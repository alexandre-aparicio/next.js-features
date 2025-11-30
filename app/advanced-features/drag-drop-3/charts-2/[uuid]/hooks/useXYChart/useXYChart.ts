// /lib/hooks/useXYChart.ts
import { useXYChartCommon, getSeriesNames, getColors } from './useXYChartCommon';

export function useXYChart() {
  const { rootRef, loadAmCharts, safeDispose } = useXYChartCommon();

  const renderXYChart = async (data: any[], xField: string, yField: string, xFieldName: string, yFieldName: string) => {
    await loadAmCharts();

    const am5 = window.am5;
    const am5xy = window.am5xy;
    const Animated = window.am5themes_Animated;

    if (!am5 || !am5xy || !Animated) {
      console.error('amCharts no está cargado');
      return;
    }

    const target = document.getElementById("xyChart");
    if (!target) {
      console.error('Contenedor xyChart no encontrado');
      return;
    }

    target.innerHTML = '';
    safeDispose();

    try {
      const root = am5.Root.new("xyChart");
      rootRef.current = root;

      root.setThemes([Animated.new(root)]);

      const chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: false,
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

      // Create axes
      let xRenderer = am5xy.AxisRendererX.new(root, {
        minGridDistance: 30
      });
      
      let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {})
      }));

      xAxis.data.setAll(data);

      let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
        min: 0,
        renderer: am5xy.AxisRendererY.new(root, {
          strokeOpacity: 0.1
        })
      }));

      // Add legend
      let legend = chart.children.push(am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50
      }));

      const seriesNames = getSeriesNames(data);
      const colors = getColors(am5);

      console.log('Series encontradas:', seriesNames);

      // Crear series dinámicamente
      seriesNames.forEach((seriesName, index) => {
        const color = colors[index % colors.length];
        
        let series = chart.series.push(am5xy.ColumnSeries.new(root, {
          name: seriesName,
          stacked: true,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: seriesName,
          categoryXField: "category",
          tooltip: am5.Tooltip.new(root, {
            labelText: "{name}, {categoryX}: {valueY}",
            tooltipY: am5.percent(10)
          })
        }));

        series.columns.template.setAll({
          tooltipText: "{name}, {categoryX}: {valueY}",
          tooltipY: am5.percent(10),
          cornerRadiusTL: 5,
          cornerRadiusTR: 5,
          strokeOpacity: 0,
          fill: color,
          fillOpacity: 0.8
        });

        series.data.setAll(data);
        series.appear();
        legend.data.push(series);
      });

      chart.appear(1000, 100);
      console.log('Gráfico XY dinámico renderizado con', seriesNames.length, 'series');

    } catch (error) {
      console.error('Error en renderXYChart:', error);
      safeDispose();
    }
  };

  return {
    renderXYChart,
    disposeXYChart: safeDispose,
  };
}