import { useRef, useEffect } from "react";

declare const window: any;

export function useForceDirectedLinksChart() { 
  const rootRef = useRef<any>(null);

  const loadAmCharts = () => {
    return new Promise<void>((resolve) => {
      if (typeof window === "undefined") return resolve();

      if (window.am5 && window.am5hierarchy && window.am5themes_Animated) {
        return resolve();
      }

      const scripts = [
        { src: "https://cdn.amcharts.com/lib/5/index.js", key: "am5" },
        { src: "https://cdn.amcharts.com/lib/5/hierarchy.js", key: "am5hierarchy" },
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
   *   { name: "Option 1", value: 50 },
   *   { name: "Option 2", value: 30 },
   * ]
   * 
   * Se convertirá internamente a estructura jerárquica
   */
  const renderForceDirected = async (data: any[]) => {
    await loadAmCharts();

    const am5 = window.am5;
    const am5hierarchy = window.am5hierarchy;
    const Animated = window.am5themes_Animated;

    if (!am5 || !am5hierarchy || !Animated) return;

    const target = document.getElementById("chartForceDirected");
    if (!target) return;

    safeDispose();

    const root = am5.Root.new("chartForceDirected");
    rootRef.current = root;

    root.setThemes([Animated.new(root)]);

    const container = root.container.children.push(
      am5.Container.new(root, {
        width: am5.percent(100),
        height: am5.percent(100),
        layout: root.verticalLayout,
      })
    );

    const series = container.children.push(
      am5hierarchy.ForceDirected.new(root, {
        singleBranchOnly: false,
        downDepth: 1,
        topDepth: 1,
        initialDepth: 1,
        valueField: "value",
        categoryField: "name",
        childDataField: "children",
        minRadius: 20,
        maxRadius: 60,
      })
    );

    // Convertir datos planos a estructura jerárquica
    const hierarchicalData = {
      name: "Root",
      children: data.map(item => ({
        name: item.name,
        value: item.value,
      })),
    };

    series.data.setAll([hierarchicalData]);

    series.nodes.template.setAll({
      tooltipText: "{name}: {value}",
      cursorOverStyle: "pointer",
    });

    series.appear(1000, 100);
  };

  return {
    renderForceDirected,
    disposeForceDirected: safeDispose,
  };
}