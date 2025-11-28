'use client';

import { useEffect } from 'react';
import { useTreeMapChart } from '../hooks/useTreeMapChart';

interface Props {
  data: { name: string; children: { name: string; value: number }[] };
}

export const TreeMapChart: React.FC<Props> = ({ data }) => {
  const { renderTree, disposeTree } = useTreeMapChart();

  useEffect(() => {
    if (data) {
      renderTree(data);
    }
    return () => {
      disposeTree();
    };
  }, [data]);

  return <div id="treemapdiv" style={{ width: '100%', height: '320px' }}></div>;
};
