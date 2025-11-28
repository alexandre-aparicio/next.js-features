'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

// Hooks
import { useChartManager } from './hooks/useChartManager';
import { useDonutChart } from './hooks/useDonutChart';
import { useBarChart } from './hooks/useBarChart';
import { useTreeMapChart } from './hooks/useTreeMapChart';
import { useStackedColumnChart } from './hooks/useStackedColumnChart';
import { useVariableRadiusPieChart } from './hooks/useVariableRadiusPieChart';
import { useClusteredBarChart } from './hooks/useClusteredBarChart';
import { useSemiCirclePieChart } from './hooks/useSemiCirclePieChart';
import { useForceDirectedLinksChart } from './hooks/useForceDirectedLinksChart';
import { useOverlappedColumnChart } from './hooks/useOverlappedColumnChart';

// Componentes
import { FieldSelector } from './components/FieldSelector';
import { StackedChartSelector } from './components/StackedChartSelector';

export default function FormStatsPage() {
  const params = useParams();
  const uuid = params.uuid as string;

  // Hook de gestión de gráficos
  const {
    loading,
    error,
    responses,
    selectedField,
    formFields,
    xAxisField,
    yAxisField,
    chartsReady,
    setSelectedField,
    setXAxisField,
    setYAxisField,
    fetchResponses,
    generateUnivariateCharts,
    generateBivariateChart
  } = useChartManager({ uuid });

  // Hooks de gráficos individuales
  const { renderDonut, disposeDonut } = useDonutChart();
  const { renderBars, disposeBars } = useBarChart();
  const { renderTree, disposeTree } = useTreeMapChart();
  const { renderStacked, disposeStacked } = useStackedColumnChart();
  const { renderVariableRadiusPie, disposeVariableRadiusPie } = useVariableRadiusPieChart();
  const { renderClustered, disposeClustered } = useClusteredBarChart();
  const { renderSemiCircle, disposeSemiCircle } = useSemiCirclePieChart();
  const { renderForceDirected, disposeForceDirected } = useForceDirectedLinksChart();
  const { renderOverlapped, disposeOverlapped } = useOverlappedColumnChart();

  // Efectos
  useEffect(() => {
    if (uuid) {
      fetchResponses();
    }
  }, [uuid, fetchResponses]);

  useEffect(() => {
    if (!selectedField || formFields.length === 0) return;

    const univariateCharts = [
      { 
        render: renderDonut, 
        dispose: disposeDonut 
      },
      { 
        render: renderBars, 
        dispose: disposeBars 
      },
      { 
        render: renderTree, 
        dispose: disposeTree,
        customData: (data: any) => ({
          name: selectedField,
          children: data.map((item: any) => ({ name: item.fullCategory || '', value: item.value }))
        })
      },
      { 
        render: renderVariableRadiusPie, 
        dispose: disposeVariableRadiusPie 
      },
      { 
        render: renderSemiCircle, 
        dispose: disposeSemiCircle 
      },
      { 
        render: renderForceDirected, 
        dispose: disposeForceDirected,
        customData: (data: any) => data.map((item: any) => ({ name: item.fullCategory || '', value: item.value }))
      }
    ];

    generateUnivariateCharts(univariateCharts, selectedField);
  }, [selectedField, formFields, generateUnivariateCharts]);

  useEffect(() => {
    generateBivariateChart(renderStacked, disposeStacked, 'Stacked Chart');
  }, [xAxisField, yAxisField, generateBivariateChart]);

  useEffect(() => {
    generateBivariateChart(renderClustered, disposeClustered, 'Clustered Chart');
  }, [xAxisField, yAxisField, generateBivariateChart]);

  useEffect(() => {
    generateBivariateChart(renderOverlapped, disposeOverlapped, 'Overlapped Chart');
  }, [xAxisField, yAxisField, generateBivariateChart]);

  // Función para manejar apertura del modal con gráfico
  const handleOpenModalChart = (field: string, type?: string) => {
    console.log('Abriendo modal para campo:', field, 'tipo:', type);
    
    // Generar datos para el campo seleccionado
    const counts: Record<string, number> = {};
    let total = 0;

    responses.forEach((r) => {
      const value = r.responses[field];
      if (value?.trim()) {
        counts[value] = (counts[value] || 0) + 1;
        total++;
      }
    });

    const data = Object.entries(counts)
      .map(([category, value]) => ({
        category: category.length > 20 ? category.substring(0, 20) + '...' : category,
        fullCategory: category,
        value,
        realPercent: total > 0 ? ((value / total) * 100).toFixed(2) : '0.00'
      }))
      .sort((a, b) => b.value - a.value);

    // Renderizar el gráfico correspondiente en el modal
    setTimeout(() => {
      console.log('Renderizando gráfico tipo:', type);
      if (type === 'donut') {
        console.log('Llamando a renderDonut con datos:', data);
        renderDonut(data);
      } else {
        console.log('Llamando a renderBars con datos:', data);
        renderBars(data);
      }
    }, 400);
  };

  if (loading) return <div className="p-6">Cargando estadísticas...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        <div className="bg-white rounded p-6 shadow mb-6">
          <h1 className="text-2xl font-bold">Estadísticas</h1>
          <p>UUID: {uuid}</p>
        </div>

        {formFields.length > 0 && (
          <FieldSelector
            formFields={formFields}
            selectedField={selectedField}
            onSelectField={setSelectedField}
            onOpenModal={handleOpenModalChart}
          />
        )}

        {selectedField && (
          <div className="bg-white p-6 rounded shadow mb-6">
            <h2 className="text-xl font-bold mb-4">Distribución de respuestas: {selectedField}</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center justify-center">
                <div id="chartdiv3" style={{ width: "100%", height: "400px" }}></div>
              </div>
              <div className="flex items-center justify-center">
                <div id="chartdiv2" style={{ width: "100%", height: "400px" }}></div>
              </div>
              <div className="flex items-center justify-center">
                <div id="treemapdiv" style={{ width: '100%', height: '320px' }}></div>
              </div>
              <div className="flex items-center justify-center">
                <div id="radiusPiediv" style={{ width: '100%', height: '320px' }}></div>
              </div>
              <div className="flex items-center justify-center">
                <div id="chartSemiCircle" style={{ width: '100%', height: '320px' }}></div>
              </div>
              <div className="flex items-center justify-center">
                <div id="chartForceDirected" style={{ width: '100%', height: '320px' }}></div>
              </div>
            </div>
            {!chartsReady && (
              <div className="text-center text-gray-500 mt-4">
                Cargando gráficos...
              </div>
            )}
          </div>
        )}

        {formFields.length > 1 && (
          <>
            <div className="col-span-1 mb-4">
              <StackedChartSelector
                formFields={formFields}
                xAxisField={xAxisField}
                yAxisField={yAxisField}
                onSelectXAxis={setXAxisField}
                onSelectYAxis={setYAxisField}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="col-span-1">
                <div className="bg-white p-6 rounded shadow">
                  <h2 className="text-xl font-bold mb-4">Stacked Column Chart</h2>
                  <div id="chartstacked" style={{ width: '100%', height: '400px' }}></div>
                </div>
              </div>
              <div className="col-span-1">
                <div className="bg-white p-6 rounded shadow">
                  <h2 className="text-xl font-bold mb-4">Clustered Bar Chart</h2>
                  <div id="chartclustered" style={{ width: '100%', height: '400px' }}></div>
                </div>
              </div>
              <div className="col-span-1">
                <div className="bg-white p-6 rounded shadow">
                  <h2 className="text-xl font-bold mb-4">Overlapped Column Chart</h2>
                  <div id="chartoverlapped" style={{ width: '100%', height: '400px' }}></div>
                </div>
              </div>
            </div>
          </>
        )}

        {formFields.length === 0 && !loading && (
          <div className="bg-white p-6 rounded shadow mb-6">
            <div className="text-center text-gray-500">
              No se encontraron datos para el formulario con UUID: {uuid}
            </div>
          </div>
        )}

      </div>
    </div>  
  );
}