// /lib/hooks/useBarChart.ts
import { useRef, useEffect } from "react";

declare const window: any;

export function useBarChart() {
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

  const renderBars = async (data: any[]) => {
    await loadAmCharts();

    const am5 = window.am5;
    const am5xy = window.am5xy;
    const Animated = window.am5themes_Animated;

    if (!am5 || !am5xy || !Animated) return;

    const target = document.getElementById("chartdiv2");
    if (!target) return;

    safeDispose();

    const root = am5.Root.new("chartdiv2");
    rootRef.current = root;

    root.setThemes([Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
      })
    );

    // X axis - sin cuadrícula
    const xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 20,
    });
    xRenderer.grid.template.setAll({ visible: false });
    xRenderer.labels.template.setAll({
      rotation: -45,
      centerY: am5.p50,
      centerX: am5.p100,
      fontSize: 11,
    });

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: xRenderer,
      })
    );

    xAxis.data.setAll(data || []);

    // Y axis - sin cuadrícula
    const yRenderer = am5xy.AxisRendererY.new(root, {});
    yRenderer.grid.template.setAll({ visible: false });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        renderer: yRenderer
      })
    );

    // Column Series
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Values",
        xAxis,
        yAxis,
        valueYField: "value",
        categoryXField: "category",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{categoryX}: {valueY}",
        }),
      })
    );

    series.columns.template.setAll({
      cornerRadiusTL: 5,
      cornerRadiusTR: 5,
    });

    series.data.setAll(data || []);

    series.appear(800);
    chart.appear(800);
  };

  return {
    renderBars,
    disposeBars: safeDispose,
  };
}