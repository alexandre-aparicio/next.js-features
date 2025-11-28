'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';

// Hooks
import { useChartManager } from './hooks/useChartManager';
import { useDonutChart } from './hooks/useDonutChart';
import { useBarChart } from './hooks/useBarChart';
import { useTreeMapChart } from './hooks/useTreeMapChart';
import { useVariableRadiusPieChart } from './hooks/useVariableRadiusPieChart';
import { useSemiCirclePieChart } from './hooks/useSemiCirclePieChart';
import { useForceDirectedLinksChart } from './hooks/useForceDirectedLinksChart';

interface DraggedIcon {
  icon: string;
  field: string;
  type: string;
  title: string;
}

export default function FormStatsPage() {
  const params = useParams();
  const uuid = params.uuid as string;

  const {
    loading,
    error,
    responses,
    selectedField,
    formFields,
    setSelectedField,
    fetchResponses,
  } = useChartManager({ uuid });

  const [selectedIcon, setSelectedIcon] = useState<string>('bar');
  const [draggedIcons, setDraggedIcons] = useState<(DraggedIcon | null)[]>([null, null, null, null]);
  const [availableTitles, setAvailableTitles] = useState<string[]>(['', '', '', '']);
  const dragIcon = useRef<DraggedIcon | null>(null);

// Función para formatear los nombres de los campos
const formatFieldName = (field: string) => {
  // Remover __ y números finales
  const cleanField = field.replace(/__\d+$/, '').replace(/_/g, ' ');
  
  // Capitalizar solo la primera letra y el resto en minúscula
  return cleanField.charAt(0).toUpperCase() + cleanField.slice(1).toLowerCase();
};

  // Hooks de gráficos individuales
  const { renderDonut, disposeDonut } = useDonutChart();
  const { renderBars, disposeBars } = useBarChart();
  const { renderTree, disposeTree } = useTreeMapChart();
  const { renderVariableRadiusPie, disposeVariableRadiusPie } = useVariableRadiusPieChart();
  const { renderSemiCircle, disposeSemiCircle } = useSemiCirclePieChart();
  const { renderForceDirected, disposeForceDirected } = useForceDirectedLinksChart();

  useEffect(() => {
    if (uuid) fetchResponses();
  }, [uuid, fetchResponses]);

  const cleanupAllCharts = () => {
    try {
      disposeDonut();
      disposeBars();
      disposeTree();
      disposeVariableRadiusPie();
      disposeSemiCircle();
      disposeForceDirected();
    } catch (err) {
      console.warn('Error cleaning up charts:', err);
    }
  };

  const generateChartData = (field: string) => {
    const counts: Record<string, number> = {};
    let total = 0;

    responses.forEach((r) => {
      const value = r.responses[field];
      if (value?.trim()) {
        counts[value] = (counts[value] || 0) + 1;
        total++;
      }
    });

    return Object.entries(counts)
      .map(([category, value]) => ({
        category: category.length > 20 ? category.substring(0, 20) + '...' : category,
        fullCategory: category,
        value,
        realPercent: total > 0 ? ((value / total) * 100).toFixed(2) : '0.00',
      }))
      .sort((a, b) => b.value - a.value);
  };

  useEffect(() => {
    if (!selectedField || formFields.length === 0 || responses.length === 0) return;

    const data = generateChartData(selectedField);

    cleanupAllCharts();

    setTimeout(async () => {
      try {
        switch (selectedIcon) {
          case 'bar':
            await renderBars(data);
            break;
          case 'donut':
            await renderDonut(data);
            break;
          case 'tree':
            await renderTree({
              name: selectedField,
              children: data.map((item: any) => ({ name: item.fullCategory || '', value: item.value })),
            });
            break;
          case 'variable':
            await renderVariableRadiusPie(data);
            break;
          case 'semi':
            await renderSemiCircle(data);
            break;
          case 'force':
            await renderForceDirected(data.map((item: any) => ({ name: item.fullCategory || '', value: item.value })));
            break;
        }
      } catch (err) {
        console.error('Error renderizando gráfico:', err);
      }
    }, 200);
  }, [selectedField, selectedIcon, responses]);

  const handleIconClick = (iconName: string) => setSelectedIcon(iconName);
  const handleFieldClick = (field: string) => {
    setSelectedField(field);
    setSelectedIcon('bar');
  };

  // Verificar si un icono ya está asignado
  const isIconAssigned = (field: string, type: string) => {
    return draggedIcons.some(icon => icon && icon.field === field && icon.type === type);
  };

  // Drag & Drop Iconos
  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, iconData: { icon: string; type: string; title: string }) => {
    if (!selectedField) return;
    
    const dragData: DraggedIcon = {
      icon: iconData.icon,
      field: selectedField,
      type: iconData.type,
      title: iconData.title
    };
    
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    dragIcon.current = dragData;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-blue-50', 'border-blue-400');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-400');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-400');
    
    try {
      const dragData = JSON.parse(e.dataTransfer.getData('application/json')) as DraggedIcon;
      
      if (dragData && dragData.field && dragData.type) {
        // Verificar si ya existe este icono en otro espacio
        const alreadyExists = draggedIcons.some(icon => 
          icon && icon.field === dragData.field && icon.type === dragData.type
        );
        
        if (!alreadyExists) {
          setDraggedIcons((prev) => {
            const newIcons = [...prev];
            newIcons[index] = dragData;
            return newIcons;
          });
        }
      }
    } catch (error) {
      console.error('Error procesando drop:', error);
    }
    
    dragIcon.current = null;
  };

  const removeIconFromSpace = (index: number) => {
    setDraggedIcons((prev) => {
      const newIcons = [...prev];
      newIcons[index] = null;
      return newIcons;
    });
    setAvailableTitles((prev) => {
      const newTitles = [...prev];
      newTitles[index] = '';
      return newTitles;
    });
  };

  const handleTitleChange = (index: number, value: string) => {
    setAvailableTitles((prev) => {
      const newTitles = [...prev];
      newTitles[index] = value;
      return newTitles;
    });
  };

  // Obtener iconos disponibles para el campo seleccionado
  const getAvailableIcons = () => {
    if (!selectedField) return [];
    
    const icons = [
      { name: 'bar', icon: 'ti ti-chart-bar', title: 'Gráfico de Barras' },
      { name: 'donut', icon: 'ti ti-chart-donut', title: 'Gráfico Donut' },
      { name: 'tree', icon: 'ti ti-table-alias', title: 'Gráfico en árbol' },
      { name: 'variable', icon: 'ti ti-chart-pie-4', title: 'Gráfico Variable' },
      { name: 'semi', icon: 'ti ti-chart-pie', title: 'Gráfico Semi-Circular' },
      { name: 'force', icon: 'ti ti-chart-bubble', title: 'Gráfico de Burbujas' }
    ];

    return icons.map(icon => ({
      ...icon,
      disabled: isIconAssigned(selectedField, icon.name)
    }));
  };

  if (loading) return <div className="p-6">Cargando estadísticas...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <>
      {/* Incluir los estilos de Tabler Icons */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
      
      <div className="min-h-screen bg-gray-50 p-4">
        {/* Encabezado */}
        <div className="bg-white rounded-lg shadow mb-4 p-4">
          <h1 className="text-2xl font-bold">Estadísticas</h1>
          <p className="text-gray-600">UUID: {uuid}</p>
        </div>

        {formFields.length > 0 && (
          <div className="grid grid-cols-2 grid-rows-2 gap-4 h-[calc(100vh-120px)]">
            {/* Cuadrante 1: Arriba Izquierda - Botones e Iconos */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-3">Selecciona un campo</h2>
              <div className="flex flex-col h-[calc(100%-40px)]">
                <div className="flex gap-2 flex-wrap mb-4">
                  {formFields.map((f) => (
                    <div key={f} className="relative flex flex-col items-center">
                      <button
                        onClick={() => handleFieldClick(f)}
                        className={`px-3 py-2 rounded border-2 text-sm ${
                          selectedField === f
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        {formatFieldName(f)}
                      </button>

                      {selectedField === f && (
                        <div className="flex gap-1 mt-2">
                          {getAvailableIcons().map((icon) => (
                            <button
                              key={icon.name}
                              draggable={!icon.disabled}
                              onDragStart={(e) => handleDragStart(e, { 
                                icon: icon.icon, 
                                type: icon.name, 
                                title: icon.title 
                              })}
                              onClick={() => handleIconClick(icon.name)}
                              className={`w-8 h-8 rounded flex items-center justify-center text-base border-2 transition-all ${
                                icon.disabled 
                                  ? 'cursor-not-allowed opacity-30 border-gray-200 bg-gray-100 text-gray-400' 
                                  : selectedIcon === icon.name 
                                    ? 'border-blue-500 bg-blue-100 text-blue-600 cursor-pointer' 
                                    : 'border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-grab active:cursor-grabbing hover:scale-105'
                              }`}
                              title={icon.disabled ? `${icon.title} (Ya asignado)` : icon.title}
                              disabled={icon.disabled}
                            >
                              <i className={icon.icon}></i>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cuadrante 2: Arriba Derecha - 4 espacios disponibles */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="grid grid-cols-2 gap-3 h-full">
                {Array.from({ length: 4 }).map((_, idx) => {
                  const hasContent = availableTitles[idx] || draggedIcons[idx];
                  return (
                    <div
                      key={idx}
                      className={`border-2 rounded-lg transition-colors relative ${
                        hasContent 
                          ? 'border-purple-400 bg-purple-50' 
                          : 'border-dashed border-gray-400 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {/* Campo de título editable - Integrado sin aspecto de input */}
                      <div className="absolute top-2 left-2 right-10">
                        <input
                          type="text"
                          value={availableTitles[idx]}
                          onChange={(e) => handleTitleChange(idx, e.target.value)}
                          placeholder={hasContent ? "Escribe el título..." : ""}
                          className={`w-full px-2 py-1 text-sm bg-transparent focus:outline-none ${
                            hasContent 
                              ? 'text-gray-800 placeholder-gray-500' 
                              : 'text-transparent placeholder-transparent'
                          }`}
                        />
                      </div>
                      
                      {/* Botón de eliminar en la esquina superior derecha */}
                      {hasContent && (
                        <button
                          onClick={() => removeIconFromSpace(idx)}
                          className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                          title="Eliminar"
                        >
                          <i className="ti ti-x text-xs"></i>
                        </button>
                      )}
                      
                      {/* Contenido del espacio */}
                      <div className={`flex flex-col items-center justify-center h-full p-2 ${hasContent ? 'pt-8' : ''}`}>
                        {draggedIcons[idx] ? (
                          <>
                            {/* Icono del gráfico - MUY GRANDE en el centro */}
                            <i className={`${draggedIcons[idx].icon} text-7xl text-gray-700 mb-2`}></i>
                            
                            {/* Nombre del campo en la parte inferior izquierda */}
                            <div className="absolute bottom-1 left-2 w-full">
                              <span className="text-xs text-gray-600 font-medium truncate block">
                                {formatFieldName(draggedIcons[idx].field)}
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-500 text-xs text-center">
                            Espacio {idx + 1}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cuadrante 3: Abajo Izquierda - Área Drop */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-3">Gráficos asignados</h2>
              <div className="grid grid-cols-2 gap-3 h-[calc(100%-40px)]">
                {Array.from({ length: 4 }).map((_, idx) => {
                  const iconInSpace = draggedIcons[idx];
                  return (
                    <div
                      key={idx}
                      className={`border-2 rounded-lg transition-colors relative ${
                        iconInSpace 
                          ? 'border-green-400 bg-green-50' 
                          : 'border-dashed border-gray-400 bg-gray-50 hover:bg-gray-100'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, idx)}
                    >
                      {iconInSpace ? (
                        <div className="flex flex-col items-center justify-center h-full p-2">
                          {/* Botón de eliminar en la esquina superior derecha */}
                          <button
                            onClick={() => removeIconFromSpace(idx)}
                            className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                            title="Eliminar"
                          >
                            <i className="ti ti-x text-xs"></i>
                          </button>
                          
                          {/* Icono del gráfico - MÁS GRANDE */}
                          <i className={`${iconInSpace.icon} text-2xl text-gray-700 mb-1`}></i>
                          
                          {/* Información del campo */}
                          <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                            {formatFieldName(iconInSpace.field)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-gray-500 text-xs text-center">
                            Arrastra un icono aquí
                            <br />
                            <span className="text-xs">Espacio {idx + 1}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cuadrante 4: Abajo Derecha - Gráfico Seleccionado */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-3 text-center">
                {selectedField ? `Distribución: ${formatFieldName(selectedField)}` : 'Selecciona un campo'}
              </h2>
              <div className="flex items-center justify-center h-[calc(100%-40px)]">
                {selectedField ? (
                  <div className="w-full h-full">
                    {selectedIcon === 'bar' && <div id="chartdiv2" style={{ width: '100%', height: '100%' }} />}
                    {selectedIcon === 'donut' && <div id="chartdiv" style={{ width: '100%', height: '100%' }} />}
                    {selectedIcon === 'tree' && <div id="treemapdiv" style={{ width: '100%', height: '100%' }} />}
                    {selectedIcon === 'variable' && <div id="radiusPiediv" style={{ width: '100%', height: '100%' }} />}
                    {selectedIcon === 'semi' && <div id="chartSemiCircle" style={{ width: '100%', height: '100%' }} />}
                    {selectedIcon === 'force' && <div id="chartForceDirected" style={{ width: '100%', height: '100%' }} />}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-lg w-full">
                    <span className="text-gray-400">Selecciona un campo para ver el gráfico</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {formFields.length === 0 && !loading && (
          <div className="bg-white p-6 rounded shadow">
            <div className="text-center text-gray-500">No se encontraron datos para el formulario con UUID: {uuid}</div>
          </div>
        )}
      </div>
    </>
  );
}