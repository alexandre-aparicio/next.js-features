export interface ChartDataItem {
  category: string;
  fullCategory: string;
  value: number;
  realPercent: string;
}

export interface ChartConfig {
  type: string;
  data: ChartDataItem[];
  field: string;
}

export interface MiniChartConfig extends ChartConfig {
  containerId: string;
}