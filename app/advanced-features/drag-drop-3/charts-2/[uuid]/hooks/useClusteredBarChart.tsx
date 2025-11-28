import { useRef, useEffect } from "react";

declare const window: any;

export function useClusteredBarChart() {
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
   *   { category: "Opción 1", A: 5, B: 2, C: 1 },
   *   { category: "Opción 2", A: 7, B: 3, C: 2 },
   * ]
   *
   * seriesKeys: ["A", "B", "C"]
   */
  const renderClustered = async (data: any[], seriesKeys: string[]) => {
    await loadAmCharts();

    const am5 = window.am5;
    const am5xy = window.am5xy;
    const Animated = window.am5themes_Animated;
    if (!am5 || !am5xy || !Animated) return;

    const target = document.getElementById("chartclustered");
    if (!target) return;

    // limpiar previo
    safeDispose();

    const root = am5.Root.new("chartclustered");
    rootRef.current = root;

    root.setThemes([Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        paddingLeft: 0,
        layout: root.verticalLayout,
      })
    );

    // Y axis (Category) - Vertical para barras horizontales
    const yRenderer = am5xy.AxisRendererY.new(root, {
      inversed: true,
      cellStartLocation: 0.1,
      cellEndLocation: 0.9,
      minorGridEnabled: true,
    });
    yRenderer.grid.template.setAll({ visible: false });
    yRenderer.labels.template.setAll({
      rotation: -45,
      centerY: am5.p50,
      centerX: am5.p100,
      fontSize: 11,
    });

    const yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: yRenderer,
      })
    );
    yAxis.data.setAll(data);

    // X axis (Value) - Horizontal para barras horizontales
    const xRenderer = am5xy.AxisRendererX.new(root, {
      strokeOpacity: 0.1,
      minGridDistance: 50,
    });
    xRenderer.grid.template.setAll({ visible: false });

    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        renderer: xRenderer,
      })
    );

    // Crear series para cada key (Clustered Horizontal)
    seriesKeys.forEach((key) => {
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: key,
          xAxis,
          yAxis,
          valueXField: key,
          categoryYField: "category",
          sequencedInterpolation: true,
          tooltip: am5.Tooltip.new(root, {
            pointerOrientation: "horizontal",
            labelText: "[bold]{name}[/]\n{categoryY}: {valueX}",
          }),
        })
      );

      series.columns.template.setAll({
        height: am5.p100,
        strokeOpacity: 0,
      });

      // Bullets para mostrar valores
      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          locationX: 1,
          locationY: 0.5,
          sprite: am5.Label.new(root, {
            centerY: am5.p50,
            text: "{valueX}",
            populateText: true,
            fontSize: 10,
          }),
        });
      });

      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          locationX: 1,
          locationY: 0.5,
          sprite: am5.Label.new(root, {
            centerX: am5.p100,
            centerY: am5.p50,
            text: "{name}",
            fill: am5.color(0xffffff),
            populateText: true,
            fontSize: 10,
          }),
        });
      });

      series.data.setAll(data);
      series.appear();
    });

    // Update legend data
    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
        layout: root.horizontalLayout,
      })
    );
    
    legend.labels.template.setAll({
      fontSize: 10,
    });

    legend.itemContainers.template.setAll({
      layout: root.verticalLayout,
      paddingLeft: 2,
      paddingRight: 2,
    });

    legend.markers.template.setAll({
      width: 12,
      height: 12,
    });
    
    legend.data.setAll(chart.series.values);

    // Add cursor
    const cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "zoomY",
      })
    );
    cursor.lineY.set("forceHidden", true);
    cursor.lineX.set("forceHidden", true);

    // Animate
    chart.appear(1000, 100);
  };

  return {
    renderClustered,
    disposeClustered: safeDispose,
  };
}