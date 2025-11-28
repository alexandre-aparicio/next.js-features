// hooks/useChartManager.ts
import { useState, useCallback } from 'react';
import { getFormResponses, FormResponse } from '../services/getFormResponses';
import { ChartData, CrossTabData, extractFormFields, processUnivariateData, processBivariateData } from '../utils/dataUtils';
import { cleanupCharts, renderChartsSequentially, isValidBivariateConfig } from '../utils/chartUtils';

interface UseChartManagerProps {
  uuid: string;
}

// Define tipos para las funciones de renderizado
interface RenderFunction {
  render: (data: any) => void | Promise<void>;
  dispose: () => void;
  customData?: (data: ChartData[]) => any;
}

export const useChartManager = ({ uuid }: UseChartManagerProps) => {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [formFields, setFormFields] = useState<string[]>([]);
  const [xAxisField, setXAxisField] = useState('');
  const [yAxisField, setYAxisField] = useState('');
  const [chartsReady, setChartsReady] = useState(false);

  const fetchResponses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const items = await getFormResponses(uuid);
      setResponses(items);

      if (items.length > 0) {
        const fields = extractFormFields(items);
        setFormFields(fields);

        if (fields.length > 0) {
          setSelectedField(fields[0]);
          setXAxisField(fields[0]);
          setYAxisField(fields.length > 1 ? fields[1] : fields[0]);
        }
      } else {
        setFormFields([]);
        setSelectedField('');
      }
    } catch (err: any) {
      setError('Error al cargar respuestas');
    } finally {
      setLoading(false);
    }
  }, [uuid]);

  const generateUnivariateCharts = useCallback((
    renderFunctions: RenderFunction[],
    field: string
  ) => {
    if (!field || responses.length === 0) return;

    const result = processUnivariateData(responses, field);
    setChartData(result);

    if (result.length === 0) return;

    // Cleanup
    cleanupCharts(renderFunctions.map(fn => fn.dispose));

    // Render con delays secuenciales
    const renderConfigs = renderFunctions.map((fn, index) => ({
      render: async () => {
        try {
          const dataToRender = fn.customData ? fn.customData(result) : result;
          const renderResult = fn.render(dataToRender);
          // Si devuelve una promesa, esperamos a que se resuelva
          if (renderResult && typeof (renderResult as Promise<void>).then === 'function') {
            await (renderResult as Promise<void>);
          }
        } catch (error: any) {
          // Error silencioso para producción
        }
      },
      delay: index * 200,
      name: `Chart ${index + 1}`
    }));

    renderChartsSequentially(renderConfigs).then(() => {
      setChartsReady(true);
    }).catch(() => {
      // Error silencioso para producción
    });
  }, [responses]);

  const generateBivariateChart = useCallback((
    renderFn: (data: CrossTabData[], series: string[]) => void | Promise<void>,
    disposeFn: () => void,
    chartName: string = 'Bivariate Chart'
  ) => {
    if (!isValidBivariateConfig(xAxisField, yAxisField, responses.length)) {
      disposeFn();
      return;
    }

    const { data, series } = processBivariateData(responses, xAxisField, yAxisField);

    setTimeout(() => {
      disposeFn();
      setTimeout(async () => {
        try {
          const renderResult = renderFn(data, series);
          // Si devuelve una promesa, esperamos a que se resuelva
          if (renderResult && typeof (renderResult as Promise<void>).then === 'function') {
            await (renderResult as Promise<void>);
          }
        } catch (error: any) {
          // Error silencioso para producción
        }
      }, 200);
    }, 100);
  }, [xAxisField, yAxisField, responses]);

  return {
    // Estado
    responses,
    loading,
    error,
    selectedField,
    chartData,
    formFields,
    xAxisField,
    yAxisField,
    chartsReady,
    
    // Setters
    setSelectedField,
    setXAxisField,
    setYAxisField,
    setChartsReady,
    
    // Funciones
    fetchResponses,
    generateUnivariateCharts,
    generateBivariateChart
  };
};