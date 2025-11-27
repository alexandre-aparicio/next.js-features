// /lib/hooks/useDonutChart.ts
import { useRef, useEffect } from "react";

declare const window: any;

export function useDonutChart() {
  const rootRef = useRef<any>(null);

  const loadAmCharts = () => {
    return new Promise<void>((resolve) => {
      if (typeof window === "undefined") return resolve();

      if (window.am5 && window.am5percent && window.am5themes_Animated) {
        return resolve();
      }

      const scripts = [
        { src: "https://cdn.amcharts.com/lib/5/index.js", key: "am5" },
        { src: "https://cdn.amcharts.com/lib/5/percent.js", key: "am5percent" },
        { src: "https://cdn.amcharts.com/lib/5/themes/Animated.js", key: "am5themes_Animated" }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderDonut = async (data: any[]) => {
    await loadAmCharts();

    const am5 = (window as any).am5;
    const am5percent = (window as any).am5percent;
    const Animated = (window as any).am5themes_Animated;

    if (!am5 || !am5percent || !Animated) return;

    const target = document.getElementById("chartdiv");
    if (!target) return;

    // dispose previous root safely
    safeDispose();

    // create new root
    const root = am5.Root.new("chartdiv");
    rootRef.current = root;

    root.setThemes([Animated.new(root)]);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        innerRadius: am5.percent(55),
        radius: am5.percent(70),
      })
    );

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
      })
    );

    series.data.setAll(data || []);

    series.slices.template.set("tooltipText", "{fullCategory}: {value} ({realPercent}%)");

    series.labels.template.setAll({
      text: "{category}",
      fontSize: 11,
    });

    series.appear(800, 100);
    chart.appear(800, 100);
  };

  return {
    renderDonut,
    disposeDonut: safeDispose,
  };
}
