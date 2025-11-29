// /lib/hooks/useMiniCharts.ts
import { useRef, useEffect } from "react";
import { renderMiniBars } from "./miniCharts/barChartRenderer";

declare const window: any;

export function useMiniCharts() {
  const rootRefs = useRef<{ [key: string]: any }>({});
  const seriesRefs = useRef<{ [key: string]: any }>({});

  const loadAmCharts = () => {
    return new Promise<void>((resolve) => {
      if (typeof window === "undefined") return resolve();

      if (window.am5 && window.am5xy && window.am5percent && window.am5themes_Animated) {
        return resolve();
      }

      const scripts = [
        { src: "https://cdn.amcharts.com/lib/5/index.js", key: "am5" },
        { src: "https://cdn.amcharts.com/lib/5/xy.js", key: "am5xy" },
        { src: "https://cdn.amcharts.com/lib/5/percent.js", key: "am5percent" },
        { src: "https://cdn.amcharts.com/lib/5/themes/Animated.js", key: "am5themes_Animated" }
      ];

      let loaded = 0;
      scripts.forEach(({ src, key }) => {
        if (window[key]) { loaded++; if (loaded === scripts.length) resolve(); return; }
        const script = document.createElement("script");
        script.src = src; script.async = true;
        script.onload = () => { loaded++; if (loaded === scripts.length) resolve(); };
        document.head.appendChild(script);
      });
    });
  };

  const loadHierarchyCharts = () => {
    return new Promise<void>((resolve) => {
      if (typeof window === "undefined") return resolve();

      if (window.am5 && window.am5hierarchy && window.am5themes_Animated) {
        return resolve();
      }

      const scripts = [
        { src: "https://cdn.amcharts.com/lib/5/index.js", key: "am5" },
        { src: "https://cdn.amcharts.com/lib/5/hierarchy.js", key: "am5hierarchy" },
        { src: "https://cdn.amcharts.com/lib/5/themes/Animated.js", key: "am5themes_Animated" }
      ];

      let loaded = 0;
      scripts.forEach(({ src, key }) => {
        if (window[key]) { loaded++; if (loaded === scripts.length) resolve(); return; }
        const script = document.createElement("script");
        script.src = src; script.async = true;
        script.onload = () => { loaded++; if (loaded === scripts.length) resolve(); };
        document.head.appendChild(script);
      });
    });
  };

  // ------------------------------
  // Dispose de gráficos
  // ------------------------------
  const safeDispose = (chartId: string) => {
    if (rootRefs.current[chartId]) {
      try {
        if (!rootRefs.current[chartId].isDisposed()) {
          rootRefs.current[chartId].dispose();
        }
      } catch (e) {}
      rootRefs.current[chartId] = null;
      seriesRefs.current[chartId] = null;
    }
  };

  const disposeAllMiniCharts = () => {
    Object.keys(rootRefs.current).forEach(chartId => safeDispose(chartId));
    rootRefs.current = {};
    seriesRefs.current = {};
  };

  useEffect(() => disposeAllMiniCharts, []);

  const renderMiniDonut = async (data: any[], fieldName: string, containerId: string) => {
    await loadAmCharts();
    const { am5, am5percent, am5themes_Animated } = window;
    if (!am5 || !am5percent || !am5themes_Animated) return;

    const target = document.getElementById(containerId);
    if (!target) return;
    target.innerHTML = '';

    safeDispose(containerId);

    try {
      const root = am5.Root.new(containerId);
      rootRefs.current[containerId] = root;
      root.setThemes([am5themes_Animated.new(root)]);

      const chart = root.container.children.push(am5percent.PieChart.new(root, { innerRadius: am5.percent(40), width: am5.percent(100), height: am5.percent(100) }));
      const series = chart.series.push(am5percent.PieSeries.new(root, { name: fieldName, valueField: "value", categoryField: "category" }));

      series.labels.template.setAll({ fontSize: 8, text: "{category}", inside: true });
      series.ticks.template.setAll({ forceHidden: true });

      series.data.setAll(data || []);
      seriesRefs.current[containerId] = series;

      series.appear(300);
      chart.appear(300);
    } catch (error) {
      console.error('Error mini-donut:', error);
    }
  };

  const renderMiniTree = async (data: any[], fieldName: string, containerId: string) => {
    await loadHierarchyCharts();
    const { am5, am5hierarchy, am5themes_Animated } = window;
    if (!am5 || !am5hierarchy || !am5themes_Animated) return;

    const target = document.getElementById(containerId);
    if (!target) return;
    target.innerHTML = '';

    safeDispose(containerId);

    try {
      const root = am5.Root.new(containerId);
      rootRefs.current[containerId] = root;
      root.setThemes([am5themes_Animated.new(root)]);

      const container = root.container.children.push(am5.Container.new(root, { width: am5.percent(100), height: am5.percent(100), layout: root.verticalLayout }));
      const series = container.children.push(am5hierarchy.Treemap.new(root, {
        singleBranchOnly: false,
        downDepth: 1,
        upDepth: -1,
        initialDepth: 2,
        valueField: "value",
        categoryField: "name",
        childDataField: "children",
        nodePaddingOuter: 0,
        nodePaddingInner: 0
      }));

      series.rectangles.template.setAll({ strokeWidth: 1, fillOpacity: 0.8 });

      const hierarchicalData = { name: fieldName || "Root", children: data.map(item => ({ name: item.category, value: item.value })) };
      series.data.setAll([hierarchicalData]);
      seriesRefs.current[containerId] = series;

      if (series.dataItems.length > 0) series.set("selectedDataItem", series.dataItems[0]);
      series.appear(300, 100);
    } catch (error) {
      console.error('Error mini-tree:', error);
    }
  };

  const renderMiniVariablePie = async (data: any[], fieldName: string, containerId: string) => {
    await loadAmCharts();
    const { am5, am5percent, am5themes_Animated } = window;
    if (!am5 || !am5percent || !am5themes_Animated) return;

    const target = document.getElementById(containerId);
    if (!target) return;
    target.innerHTML = '';

    safeDispose(containerId);

    try {
      const root = am5.Root.new(containerId);
      rootRefs.current[containerId] = root;
      root.setThemes([am5themes_Animated.new(root)]);

      const chart = root.container.children.push(am5percent.PieChart.new(root, { layout: root.verticalLayout, width: am5.percent(100), height: am5.percent(100) }));
      const series = chart.series.push(am5percent.PieSeries.new(root, { alignLabels: true, calculateAggregates: true, valueField: "value", categoryField: "category", name: fieldName }));

      series.slices.template.setAll({ strokeWidth: 2, stroke: am5.color(0xffffff) });
      series.slices.template.adapters.add("radius", (radius: number, target: any) => {
        let dataItem = target.dataItem;
        let high = series.getPrivate("valueHigh");
        if (dataItem) {
          let value = target.dataItem.get("valueWorking", 0);
          return radius * value / high;
        }
        return radius;
      });

      series.data.setAll(data.map(item => ({ value: item.value, category: item.category })));
      seriesRefs.current[containerId] = series;

      const legend = chart.children.push(am5.Legend.new(root, { centerX: am5.p50, x: am5.p50, marginTop: 10, marginBottom: 10 }));
      legend.data.setAll(series.dataItems);
      legend.labels.template.setAll({ fontSize: 8 });

      series.appear(300, 100);
    } catch (error) {
      console.error('Error mini-variable pie:', error);
    }
  };

  const renderMiniChart = async (type: string, data: any[], fieldName: string, containerId: string) => {
    switch(type) {
      case 'bar': 
        return renderMiniBars({
          data,
          fieldName,
          containerId,
          rootRefs,
          seriesRefs,
          safeDispose
        });
      case 'donut': 
        return renderMiniDonut(data, fieldName, containerId);
      case 'tree': 
        return renderMiniTree(data, fieldName, containerId);
      case 'variable': 
        return renderMiniVariablePie(data, fieldName, containerId);
      case 'semi': 
        return renderMiniDonut(data, fieldName, containerId);
      default: 
        return renderMiniBars({
          data,
          fieldName,
          containerId,
          rootRefs,
          seriesRefs,
          safeDispose
        });
    }
  };

  return { 
    renderMiniChart, 
    disposeAllMiniCharts, 
    safeDispose, 
    rootRefs, 
    seriesRefs,
    loadAmCharts,
    loadHierarchyCharts
  };
}