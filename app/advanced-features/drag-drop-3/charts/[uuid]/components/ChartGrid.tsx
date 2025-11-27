'use client';

import { DonutChart } from './DonutChart';
import { BarChart } from './BarChart';
import { TreeMapChart } from './TreeMapChart';
import { StackedColumnChart } from './StackedColumnChart';

interface Props {
  donutData: any[];
  barData: any[];
  treeData: { name: string; children: { name: string; value: number }[] };
  stackedData: any[];
  stackedSeries: string[];
}

export const ChartGrid: React.FC<Props> = ({
  donutData,
  barData,
  treeData,
  stackedData,
  stackedSeries
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="flex items-center justify-center">
        <DonutChart data={donutData} />
      </div>
      <div className="flex items-center justify-center">
        <BarChart data={barData} />
      </div>
      <div className="flex items-center justify-center">
        <TreeMapChart data={treeData} />
      </div>

      {/* stacked chart en segunda línea */}
      <div className="col-span-1 flex items-center justify-center mt-6">
        <StackedColumnChart data={stackedData} seriesFields={stackedSeries} />
      </div>
    </div>
  );
};
