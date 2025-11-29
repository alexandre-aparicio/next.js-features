// /lib/hooks/miniCharts/barChartRenderer.ts
import { RefObject } from "react";

declare const window: any;

interface BarChartRendererProps {
  data: any[];
  fieldName: string;
  containerId: string;
  rootRefs: RefObject<{ [key: string]: any }>;
  seriesRefs: RefObject<{ [key: string]: any }>;
  safeDispose: (chartId: string) => void;
}

export const renderMiniBars = async ({
  data,
  fieldName,
  containerId,
  rootRefs,
  seriesRefs,
  safeDispose
}: BarChartRendererProps): Promise<void> => {
  const { am5, am5xy, am5themes_Animated } = window;
  if (!am5 || !am5xy || !am5themes_Animated) return;

  const target = document.getElementById(containerId);
  if (!target) return;
  target.innerHTML = '';

  safeDispose(containerId);

  try {
    const root = am5.Root.new(containerId);
    rootRefs.current[containerId] = root;
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        paddingLeft: 5,
        paddingRight: 5,
        paddingTop: 5,
        paddingBottom: 5,
        width: am5.percent(100),
        height: am5.percent(100)
      })
    );

    // -----------------------------
    // X AXIS — labels abajo
    // -----------------------------
    const xRenderer = am5xy.AxisRendererX.new(root, { 
      minGridDistance: 20,
      inside: false // ⬅⬅⬅ se mueven los labels abajo
    });

    xRenderer.grid.template.setAll({ visible: false });

    xRenderer.labels.template.setAll({ 
      fontSize: 11,
      maxWidth: 30,
      textOverflow: "ellipsis",
      inside: false, 
      centerY: am5.p0,
      location: 0.5
    });

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, { 
        categoryField: "category", 
        renderer: xRenderer 
      })
    );
    xAxis.data.setAll(data || []);

    // -----------------------------
    // Y AXIS
    // -----------------------------
    const yRenderer = am5xy.AxisRendererY.new(root, { inside: true });
    yRenderer.grid.template.setAll({ visible: false });
    yRenderer.labels.template.setAll({ fontSize: 8, inside: true });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, { 
        min: 0, 
        renderer: yRenderer 
      })
    );

    // -----------------------------
    // SERIES
    // -----------------------------
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: fieldName,
        xAxis,
        yAxis,
        valueYField: "value",
        categoryXField: "category",

        tooltip: am5.Tooltip.new(root, {
          labelText: "{categoryX}: {valueY}",  
          pointerOrientation: "vertical"
        })
      })
    );

    series.set("interactive", true);

    series.columns.template.setAll({ 
      width: am5.percent(50), 
      cornerRadiusTL: 2, 
      cornerRadiusTR: 2, 
      strokeOpacity: 0,
      interactive: true,  
      tooltipText: "{categoryX}: {valueY}"    
    });
    
    series.data.setAll(data || []);
    seriesRefs.current[containerId] = series;

    series.appear(300);
    chart.appear(300);
  } catch (error) {
    console.error('Error mini-bar:', error);
  }
};
