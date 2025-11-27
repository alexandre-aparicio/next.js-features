import { useRef, useEffect } from "react";

declare const window: any;

export function useOverlappedColumnChart() {
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

  useEffect(() => {
    return () => safeDispose();
  }, []);

  /**
   * Data FORMAT expected:
   * [
   *   { category: "USA", A: 3.5, B: 4.2 },
   *   { category: "UK", A: 1.7, B: 3.1 },
   * ]
   *
   * seriesKeys: ["A", "B"]
   * widths: [80, 50] - porcentajes de ancho para cada serie (opcional)
   */
  const renderOverlapped = async (
    data: any[],
    seriesKeys: string[],
    widths?: number[]
  ) => {
    await loadAmCharts();

    const am5 = window.am5;
    const am5xy = window.am5xy;
    const Animated = window.am5themes_Animated;
    if (!am5 || !am5xy || !Animated) return;

    const target = document.getElementById("chartoverlapped");
    if (!target) return;

    // limpiar previo
    safeDispose();

    const root = am5.Root.new("chartoverlapped");
    rootRef.current = root;

    root.setThemes([Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        paddingLeft: 0,
        layout: root.verticalLayout,
      })
    );

    // X axis
    const xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 70,
      minorGridEnabled: true,
    });
    xRenderer.grid.template.setAll({ location: 1, visible: false });
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
        tooltip: am5.Tooltip.new(root, {
          themeTags: ["axis"],
          animationDuration: 200,
        }),
      })
    );
    xAxis.data.setAll(data);

    // Y axis
    const yRenderer = am5xy.AxisRendererY.new(root, {
      strokeOpacity: 0.1,
    });
    yRenderer.grid.template.setAll({ visible: false });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        renderer: yRenderer,
      })
    );

    // Crear series superpuestas (no agrupadas)
    seriesKeys.forEach((key, index) => {
      const seriesWidth = widths && widths[index] ? widths[index] : 80 - index * 20;

      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: key,
          xAxis,
          yAxis,
          valueYField: key,
          categoryXField: "category",
          clustered: false, // IMPORTANTE: false para superponerlas
          tooltip: am5.Tooltip.new(root, {
            labelText: `${key}: {valueY}`,
          }),
        })
      );

      series.columns.template.setAll({
        width: am5.percent(seriesWidth),
        tooltipY: 0,
        strokeOpacity: 0,
      });

      series.data.setAll(data);
      series.appear();
    });

    // Add cursor
    const cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));

    // Animate
    chart.appear(1000, 100);
  };

  return {
    renderOverlapped,
    disposeOverlapped: safeDispose,
  };
}