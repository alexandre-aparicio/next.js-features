import { useRef, useEffect } from "react";

declare const window: any;

export function useSemiCirclePieChart() {
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
   *   { category: "Option 1", value: 50 },
   *   { category: "Option 2", value: 30 },
   *   { category: "Option 3", value: 20 },
   * ]
   */
  const renderSemiCircle = async (data: any[]) => {
    await loadAmCharts();

    const am5 = window.am5;
    const am5percent = window.am5percent;
    const Animated = window.am5themes_Animated;
    if (!am5 || !am5percent || !Animated) return;

    const target = document.getElementById("chartSemiCircle");
    if (!target) return;

    // limpiar previo
    safeDispose();

    const root = am5.Root.new("chartSemiCircle");
    rootRef.current = root;

    root.setThemes([Animated.new(root)]);

    // Crear chart tipo Pie con semi-círculo
    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        startAngle: 180,
        endAngle: 360,
        layout: root.verticalLayout,
        innerRadius: am5.percent(20),
      })
    );

    // Crear series
    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        startAngle: 180,
        endAngle: 360,
        valueField: "value",
        categoryField: "category",
        alignLabels: false,
        radius: am5.percent(60),
      })
    );

    // Configurar labels más pequeños
    series.labels.template.setAll({
      fontSize: 12,
      textType: "regular",
      radius: 45,
    });

    // Estado oculto para animación
    series.states.create("hidden", {
      startAngle: 180,
      endAngle: 180,
    });

    // Configurar slices con esquinas redondeadas
    series.slices.template.setAll({
      cornerRadius: 5,
    });

    // Ocultar ticks
    series.ticks.template.setAll({
      forceHidden: true,
    });

    // Asignar datos
    series.data.setAll(data);

    // Animación
    series.appear(1000, 100);
  };

  return {
    renderSemiCircle,
    disposeSemiCircle: safeDispose,
  };
}