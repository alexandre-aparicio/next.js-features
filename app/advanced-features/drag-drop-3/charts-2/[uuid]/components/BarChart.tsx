'use client';

import { useEffect, useRef } from 'react';
import { useBarChart } from '../hooks/useBarChart';

interface Props {
  data: any[];
}

export const BarChart: React.FC<Props> = ({ data }) => {
  const { renderBars, disposeBars } = useBarChart();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data.length > 0 && containerRef.current) {
      // Esperar al siguiente tick del event loop
      setTimeout(() => {
        renderBars(data);
      }, 0);
    }

    return () => {
      disposeBars();
    };
  }, [data]);

  return <div ref={containerRef} id="chartdiv2" style={{ width: '100%', height: '320px' }}></div>;
};