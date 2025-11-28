'use client';

import { useEffect } from 'react';
import { useDonutChart } from '../hooks/useDonutChart';

interface Props {
  data: any[];
}

export const DonutChart: React.FC<Props> = ({ data }) => {
  const { renderDonut, disposeDonut } = useDonutChart();

  useEffect(() => {
    if (data.length > 0) {
      renderDonut(data);
    }
    return () => {
      disposeDonut();
    };
  }, [data]);

  return <div id="chartdiv" style={{ width: '100%', height: '320px' }}></div>;
};
