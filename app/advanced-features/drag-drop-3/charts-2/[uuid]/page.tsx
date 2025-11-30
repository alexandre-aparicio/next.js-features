'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';

// Hooks
import { useChartManager } from './hooks/useChartManager';
import { useDashboardManager } from './hooks/useDashboardManager';
import { useChartManagement } from './hooks/useChartManagement';

// Components
import ChartControls from './components/chartControls/LeftPanel';
import DashboardRealTime from './DashboardRealTime';
import ExpandedDashboard from './ExpandedDashboard';

// Utils
import { generateChartData, formatFieldName, generateXYData, getAllFormFields } from './utils/dataGenerators';

// Types
import { ChartType, ChartIcon, DraggedIcon } from './types/types';

type XYChartType = 'xyChart' | 'xyChart-2' | 'xyChart-3';

export default function FormStatsPage() {
  const params = useParams();
  const uuid = params.uuid as string;

  // Hooks principales
  const {
    loading,
    error,
    responses,
    selectedField,
    formFields,
    setSelectedField,
    fetchResponses,
  } = useChartManager({ uuid });

  const {
    dashboardPages,
    currentPage,
    isDashboardExpanded,
    isAnimating,
    draggedIcons,
    availableTitles,
    setDashboardPages,
    setIsDashboardExpanded,
    setIsAnimating,
    setCurrentPage,
    saveToSessionStorage,
    addNewPage,
    changePage
  } = useDashboardManager(uuid);

  const {
    renderDonut,
    renderBars,
    renderTree,
    renderVariableRadiusPie,
    renderSemiCircle,
    renderForceDirected,
    renderMiniChart,
    renderXYChart,
    renderXYChart2,   
    renderXYChart3,    
    cleanupMainCharts,
    cleanupAllCharts,
    disposeAllMiniCharts
  } = useChartManagement();

  const [selectedIcon, setSelectedIcon] = useState<ChartType>('bar');
  const dragIcon = useRef<DraggedIcon | null>(null);

  // Estados para gráfico XY
  const [xyChartActive, setXYChartActive] = useState(false);
  const [selectedXField, setSelectedXField] = useState<string>('');
  const [selectedYField, setSelectedYField] = useState<string>('');
  const [activeXField, setActiveXField] = useState<string>('');
  const [activeYField, setActiveYField] = useState<string>('');
  const [selectedIconXy, setSelectedIconXy] = useState<XYChartType>('xyChart');


  // Obtener todos los campos
  const allFields = getAllFormFields(responses);

  // Efectos principales
  useEffect(() => {
    if (uuid) fetchResponses();
  }, [uuid, fetchResponses]);

  useEffect(() => {
    return cleanupAllCharts;
  }, [cleanupAllCharts]);

  // Renderizado de mini gráficos
  useEffect(() => {
    if (isAnimating) return;
    
    draggedIcons.forEach((icon, index) => {
      if (icon) {
        let data;
        let chartType = icon.type;
        
        if (icon.type === 'xy') {
          // Para gráficos XY, generar datos específicos
          const [xField, yField] = icon.field.split('___');
          if (xField && yField) {
            data = generateXYData(responses, xField, yField);
          } else {
            console.error('Invalid XY field format:', icon.field);
            return;
          }
        } else {
          // Gráfico normal de un solo campo
          data = generateChartData(responses, icon.field, 12);
        }
        
        const containerId = `dashboard-chart-${currentPage}-${index}`;
        
        setTimeout(() => {
          if (data && data.length > 0) {
            renderMiniChart(chartType, data, icon.field, containerId, responses);
          }
        }, 100);
      }
    });
  }, [draggedIcons, currentPage, isAnimating, responses, renderMiniChart]);

  // Renderizado de gráfico principal (campo individual)
  useEffect(() => {
    if (!selectedField || formFields.length === 0 || responses.length === 0 || xyChartActive) return;

    const data = generateChartData(responses, selectedField, 20);
    cleanupMainCharts();

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
              children: data.map((item) => ({ 
                name: item.fullCategory || item.category, 
                value: item.value 
              })),
            });
            break;
          case 'variable': 
            await renderVariableRadiusPie(data); 
            break;
          case 'semi': 
            await renderSemiCircle(data); 
            break;
          case 'force': 
            await renderForceDirected(
              data.map((item) => ({ 
                name: item.fullCategory || item.category, 
                value: item.value 
              }))
            );
            break;
          default:
            console.warn('Tipo de gráfico no reconocido:', selectedIcon);
        }
      } catch (err) {
        console.error('Error renderizando gráfico:', err);
      }
    }, 200);
  }, [selectedField, selectedIcon, responses, xyChartActive, formFields.length, cleanupMainCharts, renderBars, renderDonut, renderTree, renderVariableRadiusPie, renderSemiCircle, renderForceDirected]);



  // Renderizado de gráfico XY
  useEffect(() => {
  if (xyChartActive && activeXField && activeYField && responses.length > 0) {
    cleanupMainCharts();
    
    setTimeout(async () => {
      try {
        const xyData = generateXYData(responses, activeXField, activeYField);
        if (xyData && xyData.length > 0) {
          // Renderizar el gráfico según el tipo seleccionado
          switch (selectedIconXy) {
            case 'xyChart':
              await renderXYChart(
                xyData, 
                activeXField, 
                activeYField,
                formatFieldName(activeXField),
                formatFieldName(activeYField)
              );
              break;
            case 'xyChart-2':
              await renderXYChart2(
                xyData, 
                activeXField, 
                activeYField,
                formatFieldName(activeXField),
                formatFieldName(activeYField)
              );
              break;
            case 'xyChart-3':
              await renderXYChart3(
                xyData, 
                activeXField, 
                activeYField,
                formatFieldName(activeXField),
                formatFieldName(activeYField)
              );
              break;
          }
        } else {
          console.warn('No hay datos para el gráfico XY');
          setXYChartActive(false);
        }
      } catch (err) {
        console.error('Error renderizando gráfico XY:', err);
        setXYChartActive(false);
      }
    }, 200);
  }
}, [xyChartActive, activeXField, activeYField, responses, selectedIconXy, cleanupMainCharts, renderXYChart, renderXYChart2, renderXYChart3]);
  // Handlers para campos XY
  const handleFieldDrop = (field: string, axis: 'x' | 'y') => {
    if (axis === 'x') {
      setSelectedXField(field);
      if (field && selectedYField && field !== selectedYField) {
        setActiveXField(field);
        setActiveYField(selectedYField);
        setXYChartActive(true);
      }
    } else {
      setSelectedYField(field);
      if (field && selectedXField && field !== selectedXField) {
        setActiveXField(selectedXField);
        setActiveYField(field);
        setXYChartActive(true);
      }
    }
  };

  const handleXFieldChange = (field: string) => {
    setSelectedXField(field);
    if (field && selectedYField && field !== selectedYField) {
      setActiveXField(field);
      setActiveYField(selectedYField);
      setXYChartActive(true);
    } else {
      setXYChartActive(false);
    }
  };

  const handleYFieldChange = (field: string) => {
    setSelectedYField(field);
    if (field && selectedXField && field !== selectedXField) {
      setActiveXField(selectedXField);
      setActiveYField(field);
      setXYChartActive(true);
    } else {
      setXYChartActive(false);
    }
  };

  const handleApplyXYSelection = (xField: string, yField: string) => {
    setActiveXField(xField);
    setActiveYField(yField);
    setXYChartActive(true);
    setSelectedField('');
  };

  const handleResetXYSelection = () => {
    setXYChartActive(false);
    setSelectedXField('');
    setSelectedYField('');
    setActiveXField('');
    setActiveYField('');
    cleanupMainCharts();
  };

  // Handlers principales
  const handleIconClick = (iconName: ChartType) => {
    setSelectedIcon(iconName);
    setXYChartActive(false);
  };
  
  const handleFieldClick = (field: string) => {
    setSelectedField(field);
    setSelectedIcon('bar');
    setXYChartActive(false);
    setSelectedXField('');
    setSelectedYField('');
  };

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, iconData: Omit<DraggedIcon, 'field'>) => {
    if (!selectedField && !xyChartActive) return;
    
    let dragData: DraggedIcon;
    
    if (xyChartActive && activeXField && activeYField) {
      // Gráfico XY
      dragData = {
        icon: 'ti ti-chart-scatter',
        field: `${activeXField}___${activeYField}`,
        type: 'xy',
        title: `XY: ${formatFieldName(activeXField)} vs ${formatFieldName(activeYField)}`
      };
    } else if (selectedField) {
      // Gráfico individual
      dragData = {
        icon: iconData.icon,
        field: selectedField,
        type: iconData.type,
        title: iconData.title
      };
    } else {
      return;
    }
    
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    dragIcon.current = dragData;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-blue-50', 'border-blue-400');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-400');
  };

  const handleXYIconClick = (iconName: XYChartType) => {
    setSelectedIconXy(iconName);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-400');
    
    try {
      const dragData: DraggedIcon = JSON.parse(e.dataTransfer.getData('application/json'));
      
      if (dragData?.field && dragData?.type && !isIconAssigned(dragData.field, dragData.type)) {
        const updatedPages = dashboardPages.map(page => 
          page.id === currentPage 
            ? { ...page, icons: page.icons.map((icon, idx) => idx === index ? dragData : icon) }
            : page
        );
        
        setDashboardPages(updatedPages);
        saveToSessionStorage(updatedPages);
      }
    } catch (error) {
      console.error('Error procesando drop:', error);
    }
    
    dragIcon.current = null;
  };

  const removeIconFromSpace = (index: number) => {
    const updatedPages = dashboardPages.map(page => 
      page.id === currentPage 
        ? {
            ...page,
            icons: page.icons.map((icon, idx) => idx === index ? null : icon),
            titles: page.titles.map((title, idx) => idx === index ? '' : title)
          }
        : page
    );
    
    setDashboardPages(updatedPages);
    saveToSessionStorage(updatedPages);
  };

  const handleTitleChange = (index: number, value: string) => {
    const updatedPages = dashboardPages.map(page => 
      page.id === currentPage 
        ? { ...page, titles: page.titles.map((title, idx) => idx === index ? value : title) }
        : page
    );
    
    setDashboardPages(updatedPages);
    saveToSessionStorage(updatedPages);
  };

  // Helpers
  const isIconAssigned = (field: string, type: ChartType): boolean => {
    return dashboardPages.some(page => 
      page.icons.some(icon => icon && icon.field === field && icon.type === type)
    );
  };

  const removePage = (pageId: number) => {
    if (dashboardPages.length > 1) {
      const updatedPages = dashboardPages.filter(page => page.id !== pageId);
      setDashboardPages(updatedPages);
      
      if (currentPage === pageId) {
        setCurrentPage(updatedPages[0].id);
      }
      
      saveToSessionStorage(updatedPages);
    }
  };

  const getAvailableIcons = (): ChartIcon[] => {
    if (!selectedField && !xyChartActive) return [];
    
    const icons: ChartIcon[] = [
      { name: 'bar', icon: 'ti ti-chart-bar', title: 'Gráfico de Barras' },
      { name: 'donut', icon: 'ti ti-chart-donut', title: 'Gráfico Donut' },
      { name: 'tree', icon: 'ti ti-table-alias', title: 'Gráfico en árbol' },
      { name: 'variable', icon: 'ti ti-chart-pie-4', title: 'Gráfico Variable' },
      { name: 'semi', icon: 'ti ti-chart-pie', title: 'Gráfico Semi-Circular' },
      { name: 'force', icon: 'ti ti-chart-bubble', title: 'Gráfico de Burbujas' }
    ];

    return icons.map(icon => ({
      ...icon,
      disabled: selectedField ? isIconAssigned(selectedField, icon.name) : false
    }));
  };

  const toggleDashboardExpanded = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    disposeAllMiniCharts();
    
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsDashboardExpanded(!isDashboardExpanded);
    
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Estados de carga y error
  if (loading) return <div className="p-6">Cargando estadísticas...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  // Vista expandida
  if (isDashboardExpanded) {
    return (
      <ExpandedDashboard
        dashboardPages={dashboardPages}
        currentPage={currentPage}
        isAnimating={isAnimating}
        draggedIcons={draggedIcons}
        availableTitles={availableTitles}
        formatFieldName={formatFieldName}
        onToggleExpand={toggleDashboardExpanded}
        uuid={uuid}
      />
    );
  }

  // Vista normal
  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
      
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow mb-4 p-4">
          <h1 className="text-2xl font-bold">Estadísticas</h1>
          <p className="text-gray-600">UUID: {uuid}</p>
        </div>

        {formFields.length > 0 ? (
          <div className="grid grid-cols-4 gap-4 h-[calc(100vh-120px)]">
            <ChartControls
                responses={responses}
                onFieldDrop={handleFieldDrop}
                selectedField={selectedField}
                selectedIcon={selectedIcon}             
                availableIcons={getAvailableIcons()}
                formatFieldName={formatFieldName}
                onFieldClick={handleFieldClick}
                onIconClick={handleIconClick}
                onDragStart={handleDragStart}
                selectedXField={selectedXField}
                selectedYField={selectedYField}
                onXFieldChange={handleXFieldChange}
                onYFieldChange={handleYFieldChange}
                onApplyXYSelection={handleApplyXYSelection}
                xyChartActive={xyChartActive}
                selectedIconXy={selectedIconXy}
                onXYIconClick={handleXYIconClick}
                
                activeXField={activeXField}
                activeYField={activeYField}
                onResetXYSelection={handleResetXYSelection}
                formFields={allFields}
                dashboardPages={dashboardPages}
                setDashboardPages={setDashboardPages}
                saveToSessionStorage={saveToSessionStorage}
                currentPage={currentPage}
              />
            <DashboardRealTime
              dashboardPages={dashboardPages}
              currentPage={currentPage}
              isAnimating={isAnimating}
              draggedIcons={draggedIcons}
              availableTitles={availableTitles}
              formatFieldName={formatFieldName}
              onPageChange={changePage}
              onAddPage={addNewPage}
              onRemovePage={removePage}
              onToggleExpand={toggleDashboardExpanded}
              onRemoveIcon={removeIconFromSpace}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onTitleChange={handleTitleChange}
              uuid={uuid}
            />
          </div>
        ) : (
          <div className="bg-white p-6 rounded shadow">
            <div className="text-center text-gray-500">
              No se encontraron datos para el formulario con UUID: {uuid}
            </div>
          </div>
        )}
      </div>
    </>
  );
}