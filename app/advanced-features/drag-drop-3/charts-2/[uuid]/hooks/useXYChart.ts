// /lib/hooks/useXYChart.ts
import { useRef, useEffect } from "react";

declare const window: any;

export function useXYChart() {
  const rootRef = useRef<any>(null);

  const loadAmCharts = () => {
    return new Promise<void>((resolve) => {
      if (typeof window === "undefined") return resolve();

      if (window.am5 && window.am5xy && window.am5themes_Animated) {
        return resolve();
      }

      const scripts = [
        { src: "https://cdn.amcharts.com/lib/5/index.js", key: "am5" },
        { src: "https://cdn.amcharts.com/lib/5/xy.js", key: "am5xy" },
        { src: "https://cdn.amcharts.com/lib/5/themes/Animated.js", key: "am5themes_Animated" }
      ];

      let loaded = 0;

      scripts.forEach(({ src, key }) => {
        if (window[key]) {
          loaded++;
          if (loaded === scripts.length) resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.async = true;

        script.onload = () => {
          loaded++;
          if (loaded === scripts.length) resolve();
        };

        document.head.appendChild(script);
      });
    });
  };

  const safeDispose = () => {
    if (rootRef.current) {
      try {
        if (!rootRef.current.isDisposed()) rootRef.current.dispose();
      } catch (e) {
        // ignore dispose errors
      }
      rootRef.current = null;
    }
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      safeDispose();
    };
  }, []);

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

    // Limpiar contenedor completamente
    target.innerHTML = '';
    safeDispose();

    try {
      const root = am5.Root.new("xyChart");
      rootRef.current = root;

      root.setThemes([Animated.new(root)]);

      const chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        paddingLeft: 0,
        layout: root.verticalLayout
      }));

      // Add scrollbar
      chart.set("scrollbarX", am5.Scrollbar.new(root, {
        orientation: "horizontal"
      }));

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

      // Encontrar todas las series únicas (excluir campos especiales)
      const seriesNames = [...new Set(
        data.flatMap(item => 
          Object.keys(item).filter(key => 
            key !== 'category' && 
            key !== 'total' && 
            key !== 'fullCategory' && 
            key !== 'realPercent' &&
            key !== 'animal' // También excluir 'animal' si existe
          )
        )
      )];

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

        // Make stuff animate on load
        series.appear();

        // Add to legend
        legend.data.push(series);
      });

      // Make stuff animate on load
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