'use client';

import { useEffect } from 'react';
import { useStackedColumnChart } from '../hooks/useStackedColumnChart';

interface Props {
  data: any[];
  seriesFields: string[];
}

export const StackedColumnChart: React.FC<Props> = ({ data, seriesFields }) => {
  const { renderStacked, disposeStacked } = useStackedColumnChart();

  useEffect(() => {
    if (data.length > 0 && seriesFields.length > 0) {
      renderStacked(data, seriesFields);
    }
    return () => {
      disposeStacked();
    };
  }, [data, seriesFields]);

  return <div id="chartstacked" style={{ width: '100%', height: '400px' }}></div>;
};
