// /lib/hooks/useTreeMapChart.ts
import { useRef, useEffect } from "react";

declare const window: any;

export function useTreeMapChart() {
  const rootRef = useRef<any>(null);

  const loadAmCharts = () => {
    return new Promise<void>((resolve) => {
      if (typeof window === "undefined") return resolve();

      if (
        window.am5 &&
        window.am5hierarchy &&
        window.am5themes_Animated
      ) {
        return resolve();
      }

      const scripts = [
        { src: "https://cdn.amcharts.com/lib/5/index.js", key: "am5" },
        { src: "https://cdn.amcharts.com/lib/5/hierarchy.js", key: "am5hierarchy" },
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
      } catch (e) {}
      rootRef.current = null;
    }
  };

  useEffect(() => {
    return () => safeDispose();
  }, []);

  const renderTree = async (data: any) => {
    await loadAmCharts();

    const am5 = window.am5;
    const am5hierarchy = window.am5hierarchy;
    const Animated = window.am5themes_Animated;

    if (!am5 || !am5hierarchy || !Animated) return;

    const target = document.getElementById("treemapdiv");
    if (!target) return;

    safeDispose();

    const root = am5.Root.new("treemapdiv");
    rootRef.current = root;

    root.setThemes([Animated.new(root)]);

    const container = root.container.children.push(
      am5.Container.new(root, {
        width: am5.percent(100),
        height: am5.percent(100),
        layout: root.verticalLayout
      })
    );

    const series = container.children.push(
      am5hierarchy.Treemap.new(root, {
        singleBranchOnly: false,
        downDepth: 1,
        initialDepth: 1,
        valueField: "value",
        categoryField: "name",
        childDataField: "children"
      })
    );

    series.setAll({
      fillOpacity: 0.9,
      strokeWidth: 1,
    });

    series.data.setAll([data]);
    series.appear(1000, 100);
  };

  return {
    renderTree,
    disposeTree: safeDispose,
  };
}
