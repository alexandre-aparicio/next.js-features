// /lib/hooks/useStackedColumnChart.ts
import { useRef, useEffect } from "react";

declare const window: any;

export function useStackedColumnChart() {
  const rootRef = useRef<any>(null);

  const loadAmCharts = () => {
    return new Promise<void>((resolve) => {
      if (typeof window === "undefined") return resolve();

      // Si ya están cargados
      if (window.am5 && window.am5xy && window.am5themes_Animated) {
        return resolve();
      }

      const scripts = [
        { src: "https://cdn.amcharts.com/lib/5/index.js", key: "am5" },
        { src: "https://cdn.amcharts.com/lib/5/xy.js", key: "am5xy" },
        { src: "https://cdn.amcharts.com/lib/5/themes/Animated.js", key: "am5themes_Animated" },
      ];

      let loaded = 0;

      scripts.forEach(({ src, key }) => {
        if ((window as any)[key]) {
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
      } catch (e) {}
      rootRef.current = null;
    }
  };

  // cleanup
  useEffect(() => {
    return () => safeDispose();
  }, []);

  /**
   * Data FORMAT expected:
   * [
   *   { category: "Opción 1", A: 5, B: 2, C: 1 },
   *   { category: "Opción 2", A: 7, B: 3, C: 2 },
   * ]
   *
   * series: ["A", "B", "C"]
   */
  const renderStacked = async (data: any[], seriesKeys: string[]) => {
    await loadAmCharts();

    const am5 = window.am5;
    const am5xy = window.am5xy;
    const Animated = window.am5themes_Animated;
    if (!am5 || !am5xy || !Animated) return;

    const target = document.getElementById("chartstacked");
    if (!target) return;

    // limpiar previo
    safeDispose();

    const root = am5.Root.new("chartstacked");
    rootRef.current = root;

    root.setThemes([Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        layout: root.verticalLayout,
      })
    );

    // X axis
    const xRenderer = am5xy.AxisRendererX.new(root, { 
      minGridDistance: 20
    });
    xRenderer.grid.template.setAll({ visible: false });
    
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: xRenderer,
      })
    );
    xAxis.data.setAll(data);

    // Y axis
    const yRenderer = am5xy.AxisRendererY.new(root, {});
    yRenderer.grid.template.setAll({ visible: false });
    
    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        renderer: yRenderer,
      })
    );

    // Crear series automáticamente para cada key
    seriesKeys.forEach((key) => {
      let series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: key,
          stacked: true,
          xAxis,
          yAxis,
          valueYField: key,
          categoryXField: "category",
          tooltip: am5.Tooltip.new(root, {
            labelText: "{name}: {valueY}",
          }),
        })
      );

      series.data.setAll(data);
      series.columns.template.setAll({ width: am5.percent(95) });
    });

    // Leyenda
    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
      })
    );
    legend.data.setAll(chart.series.values);

    chart.appear(1000);
  };

  return {
    renderStacked,
    disposeStacked: safeDispose,
  };
}