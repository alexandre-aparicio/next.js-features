import { useRef, useEffect } from "react";

declare const window: any;

export function useVariableRadiusPieChart() {
  const rootRef = useRef<any>(null);

  // Cargar librerías de AmCharts dinámicamente
  const loadAmCharts = () => {
    return new Promise<void>((resolve) => {
      if (typeof window === "undefined") return resolve();

      if (window.am5 && window.am5percent && window.am5themes_Animated) {
        return resolve();
      }

      const scripts = [
        { src: "https://cdn.amcharts.com/lib/5/index.js", key: "am5" },
        { src: "https://cdn.amcharts.com/lib/5/percent.js", key: "am5percent" },
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
      } catch (e) {
        // ignorar errores
      }
      rootRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      safeDispose();
    };
  }, []);

  const renderVariableRadiusPie = async (data: any[]) => {
    await loadAmCharts();

    const am5 = window.am5;
    const am5percent = window.am5percent;
    const Animated = window.am5themes_Animated;

    if (!am5 || !am5percent || !Animated) return;

    const target = document.getElementById("radiusPiediv");
    if (!target) return;

    safeDispose();

    const root = am5.Root.new("radiusPiediv");
    rootRef.current = root;

    root.setThemes([Animated.new(root)]);

    // Chart
    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
      })
    );

    // Series con radio variable
    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
        alignLabels: true,
        calculateAggregates: true,
      })
    );

    // estilo slices
    series.slices.template.setAll({
      strokeWidth: 3,
      stroke: am5.color(0xffffff),
    });

    series.labelsContainer.set("paddingTop", 30);

    // Radio variable según valor
    series.slices.template.adapters.add("radius", function (radius: any, target: any) {
      const dataItem = target.dataItem;
      if (dataItem) {
        const value = dataItem.get("valueWorking", 0);
        const high = series.getPrivate("valueHigh");
        if (high && high > 0) {
          return (radius || 0) * (value / high);
        }
      }
      return radius;
    });

    // tooltip y labels
    series.slices.template.set("tooltipText", "{category}: {value} ({realPercent}%)");
    series.labels.template.setAll({
      text: "{category}",
      fontSize: 11,
    });

    // legend
    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
        marginTop: 15,
        marginBottom: 15,
      })
    );
    legend.data.setAll(series.dataItems);

    // set data
    series.data.setAll(data || []);

    // animación inicial
    series.appear(1000, 100);
    chart.appear(1000, 100);
  };

  return {
    renderVariableRadiusPie,
    disposeVariableRadiusPie: safeDispose,
  };
}