'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';

// Hooks
import { useChartManager } from './hooks/useChartManager';
import { useDashboardManager } from './hooks/useDashboardManager';
import { useChartManagement } from './hooks/useChartManagement';

// Components
import ChartControls from './ChartControls';
import DashboardRealTime from './DashboardRealTime';
import ExpandedDashboard from './ExpandedDashboard';

// Utils
import { generateChartData, formatFieldName } from './utils/dataGenerators';

// Types
import { ChartType, ChartIcon, DraggedIcon } from './types/types';

export default function FormStatsPage() {
  const params = useParams();
  const uuid = params.uuid;

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
    cleanupMainCharts,
    cleanupAllCharts,
    disposeAllMiniCharts
  } = useChartManagement();

  const [selectedIcon, setSelectedIcon] = useState<ChartType>('bar');
  const dragIcon = useRef<DraggedIcon | null>(null);

  // Efectos principales
  useEffect(() => {
    if (uuid) fetchResponses();
  }, [uuid, fetchResponses]);

  useEffect(() => {
    return cleanupAllCharts;
  }, []);

  // Renderizado de mini gráficos
  useEffect(() => {
    if (isAnimating) return;
    
    draggedIcons.forEach((icon, index) => {
      if (icon) {
        const data = generateChartData(responses, icon.field, 12);
        const containerId = `dashboard-chart-${currentPage}-${index}`;
        
        setTimeout(() => {
          renderMiniChart(icon.type, data, icon.field, containerId);
        }, 100);
      }
    });
  }, [draggedIcons, currentPage, isAnimating, responses]);

  // Renderizado de gráfico principal
  useEffect(() => {
    if (!selectedField || formFields.length === 0 || responses.length === 0) return;

    const data = generateChartData(responses, selectedField, 20);
    cleanupMainCharts();

    setTimeout(async () => {
      try {
        switch (selectedIcon) {
          case 'bar': await renderBars(data); break;
          case 'donut': await renderDonut(data); break;
          case 'tree': 
            await renderTree({
              name: selectedField,
              children: data.map((item) => ({ name: item.fullCategory || '', value: item.value })),
            });
            break;
          case 'variable': await renderVariableRadiusPie(data); break;
          case 'semi': await renderSemiCircle(data); break;
          case 'force': 
            await renderForceDirected(data.map((item) => ({ name: item.fullCategory || '', value: item.value })));
            break;
        }
      } catch (err) {
        console.error('Error renderizando gráfico:', err);
      }
    }, 200);
  }, [selectedField, selectedIcon, responses]);

  // Handlers
  const handleIconClick = (iconName: ChartType) => setSelectedIcon(iconName);
  
  const handleFieldClick = (field: string) => {
    setSelectedField(field);
    setSelectedIcon('bar');
  };

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, iconData: Omit<DraggedIcon, 'field'>) => {
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-blue-50', 'border-blue-400');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-400');
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

  const getAvailableIcons = (): ChartIcon[] => {
    if (!selectedField) return [];
    
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
      disabled: isIconAssigned(selectedField, icon.name)
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
        onRemoveIcon={removeIconFromSpace}
        onPageChange={changePage}
        onAddPage={addNewPage}
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
              selectedField={selectedField}
              selectedIcon={selectedIcon}
              formFields={formFields}
              availableIcons={getAvailableIcons()}
              formatFieldName={formatFieldName}
              onFieldClick={handleFieldClick}
              onIconClick={handleIconClick}
              onDragStart={handleDragStart}
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