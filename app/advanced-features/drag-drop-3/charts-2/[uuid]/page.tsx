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
import { useMiniCharts } from './hooks/useMiniCharts';

interface DraggedIcon {
  icon: string;
  field: string;
  type: string;
  title: string;
}

interface DashboardPage {
  id: number;
  name: string;
  icons: (DraggedIcon | null)[];
  titles: string[];
}

// Clave para sessionStorage
const DASHBOARD_STORAGE_KEY = 'dashboard-config';

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
  const [dashboardPages, setDashboardPages] = useState<DashboardPage[]>([
    { id: 1, name: 'Página 1', icons: [null, null, null, null], titles: ['', '', '', ''] }
  ]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dragIcon = useRef<DraggedIcon | null>(null);

  // Obtener la página actual
  const currentPageData = dashboardPages.find(page => page.id === currentPage) || dashboardPages[0];
  const draggedIcons = currentPageData.icons;
  const availableTitles = currentPageData.titles;

  // Función para guardar en sessionStorage
  const saveToSessionStorage = (pages: DashboardPage[]) => {
    try {
      const config = {
        uuid,
        pages: pages.map(page => ({
          id: page.id,
          name: page.name,
          icons: page.icons,
          titles: page.titles
        }))
      };
      sessionStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(config));
      console.log('Dashboard guardado en sessionStorage');
      console.log(sessionStorage.getItem(DASHBOARD_STORAGE_KEY));
    } catch (error) {
      console.error('Error guardando en sessionStorage:', error);
    }
  };

  // Función para cargar desde sessionStorage
  const loadFromSessionStorage = () => {
    try {
      const saved = sessionStorage.getItem(DASHBOARD_STORAGE_KEY);
      if (saved) {
        const config = JSON.parse(saved);
        // Solo cargar si el UUID coincide
        if (config.uuid === uuid) {
          setDashboardPages(config.pages);
          console.log('Dashboard cargado desde sessionStorage');
          return true;
        }
      }
    } catch (error) {
      console.error('Error cargando desde sessionStorage:', error);
    }
    return false;
  };

  // Efecto para cargar configuración al montar el componente
  useEffect(() => {
    loadFromSessionStorage();
  }, [uuid]);

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
  const { renderMiniChart, disposeAllMiniCharts } = useMiniCharts();

  useEffect(() => {
    if (uuid) fetchResponses();
  }, [uuid, fetchResponses]);

  // Función para generar datos de mini gráficos (optimizada)
  const generateMiniChartData = (field: string) => {
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
        category: category.length > 12 ? category.substring(0, 12) + '...' : category,
        fullCategory: category,
        value,
        realPercent: total > 0 ? ((value / total) * 100).toFixed(2) : '0.00',
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Limitar a 6 categorías para mini gráficos
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

  // Efecto para renderizar mini gráficos cuando se asignan iconos
  useEffect(() => {
    if (isAnimating) return; // No renderizar durante animaciones
    
    draggedIcons.forEach((icon, index) => {
      if (icon) {
        const data = generateMiniChartData(icon.field);
        const containerId = `dashboard-chart-${currentPage}-${index}`;
        
        setTimeout(() => {
          renderMiniChart(icon.type, data, icon.field, containerId);
        }, 100);
      }
    });
  }, [draggedIcons, currentPage, isAnimating]);

  // Función para limpiar solo los gráficos principales (NO los mini gráficos)
  const cleanupMainCharts = () => {
    try {
      disposeDonut();
      disposeBars();
      disposeTree();
      disposeVariableRadiusPie();
      disposeSemiCircle();
      disposeForceDirected();
      // NO llamamos a disposeAllMiniCharts() aquí
    } catch (err) {
      console.warn('Error cleaning up main charts:', err);
    }
  };

  // Efecto para limpiar todo al desmontar el componente
  useEffect(() => {
    return () => {
      try {
        disposeDonut();
        disposeBars();
        disposeTree();
        disposeVariableRadiusPie();
        disposeSemiCircle();
        disposeForceDirected();
        disposeAllMiniCharts();
      } catch (err) {
        console.warn('Error cleaning up all charts on unmount:', err);
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedField || formFields.length === 0 || responses.length === 0) return;

    const data = generateChartData(selectedField);

    cleanupMainCharts(); // Solo limpia gráficos principales

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

  // Verificar si un icono ya está asignado en TODAS las páginas
  const isIconAssigned = (field: string, type: string) => {
    return dashboardPages.some(page => 
      page.icons.some(icon => icon && icon.field === field && icon.type === type)
    );
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
        // Verificar si ya existe este icono en otro espacio (en todas las páginas)
        const alreadyExists = isIconAssigned(dragData.field, dragData.type);
        
        if (!alreadyExists) {
          const updatedPages = dashboardPages.map(page => 
            page.id === currentPage 
              ? {
                  ...page,
                  icons: page.icons.map((icon, idx) => idx === index ? dragData : icon)
                }
              : page
          );
          
          setDashboardPages(updatedPages);
          saveToSessionStorage(updatedPages); // Guardar después del drop
        }
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
    saveToSessionStorage(updatedPages); // Guardar después de eliminar
  };

  const handleTitleChange = (index: number, value: string) => {
    const updatedPages = dashboardPages.map(page => 
      page.id === currentPage 
        ? {
            ...page,
            titles: page.titles.map((title, idx) => idx === index ? value : title)
          }
        : page
    );
    
    setDashboardPages(updatedPages);
    saveToSessionStorage(updatedPages); // Guardar después de cambiar título
  };

  // Añadir nueva página
  const addNewPage = () => {
    const newPageId = Math.max(...dashboardPages.map(p => p.id)) + 1;
    const updatedPages = [
      ...dashboardPages,
      {
        id: newPageId,
        name: `Página ${newPageId}`,
        icons: [null, null, null, null],
        titles: ['', '', '', '']
      }
    ];
    
    setDashboardPages(updatedPages);
    setCurrentPage(newPageId);
    saveToSessionStorage(updatedPages); // Guardar después de añadir página
  };

  // Cambiar de página
  const changePage = (pageId: number) => {
    setIsAnimating(true);
    disposeAllMiniCharts();
    
    setTimeout(() => {
      setCurrentPage(pageId);
      setIsAnimating(false);
    }, 300);
  };

  // Eliminar página (solo si no es la única)
  const removePage = (pageId: number) => {
    if (dashboardPages.length > 1) {
      const updatedPages = dashboardPages.filter(page => page.id !== pageId);
      setDashboardPages(updatedPages);
      
      if (currentPage === pageId) {
        setCurrentPage(updatedPages[0].id);
      }
      
      saveToSessionStorage(updatedPages); // Guardar después de eliminar página
    }
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

  

  const toggleDashboardExpanded = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    if (!isDashboardExpanded) {
      disposeAllMiniCharts();
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setIsDashboardExpanded(true);
    } else {
      disposeAllMiniCharts();
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setIsDashboardExpanded(false);
    }
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  useEffect(() => {
  if (!dashboardPages || dashboardPages.length === 0) return;

  // Si ya hay una página seleccionada y existe, no hacer nada
  const currentPageExists = dashboardPages.some(p => p.id === currentPage);
  if (currentPageExists) return;

  const firstPageId = dashboardPages[0].id;

  // Simula el cambio de página con animación
  const timer = setTimeout(() => {
    setIsAnimating(true);
    disposeAllMiniCharts();

    setTimeout(() => {
      setCurrentPage(firstPageId);

      // Renderizar mini gráficos después del "cambio"
      const pageData = dashboardPages.find(p => p.id === firstPageId);
      if (pageData) {
        pageData.icons.forEach((icon, index) => {
          if (icon) {
            const data = generateMiniChartData(icon.field);
            const containerId = `dashboard-chart-${firstPageId}-${index}`;
            renderMiniChart(icon.type, data, icon.field, containerId);
          }
        });
      }

      setIsAnimating(false);
    }, 300); // Duración de la animación de cambio de página
  }, 100); // Pequeño delay para que el DOM esté listo

  return () => clearTimeout(timer);
}, [dashboardPages]);


  if (loading) return <div className="p-6">Cargando estadísticas...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  // Si el dashboard está expandido, mostrar solo el dashboard en pantalla completa
  if (isDashboardExpanded) {
    return (
      <>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
        
        <div className="min-h-screen bg-gray-50 p-4">
          {/* Header en modo expandido con animación */}
          <div className={`bg-white rounded-lg shadow mb-4 p-4 flex justify-between items-center transition-all duration-500 ${
            isAnimating ? 'opacity-0 transform -translate-y-10' : 'opacity-100 transform translate-y-0'
          }`}>
            <div>
              <h1 className="text-2xl font-bold">Dashboard en Tiempo Real</h1>
              <p className="text-gray-600">UUID: {uuid}</p>
            </div>
            <button
              onClick={toggleDashboardExpanded}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-300 hover:scale-110"
              title="Minimizar dashboard"
            >
              <i className="ti ti-x text-xl"></i>
            </button>
          </div>

          {/* Dashboard en pantalla completa con animación */}
          <div className={`bg-white rounded-lg shadow p-6 transition-all duration-700 ${
            isAnimating ? 'opacity-0 transform scale-95 translate-y-10' : 'opacity-100 transform scale-100 translate-y-0'
          }`}>
            <div className="grid grid-cols-2 gap-6 h-[calc(100vh-180px)]">
              {Array.from({ length: 4 }).map((_, idx) => {
                const iconInSpace = draggedIcons[idx];
                const title = availableTitles[idx];
                
                return (
                  <div
                    key={idx}
                    className={`border-2 rounded-lg transition-all duration-500 relative ${
                      isAnimating 
                        ? 'opacity-0 transform translate-y-10 scale-95' 
                        : 'opacity-100 transform translate-y-0 scale-100'
                    } ${
                      iconInSpace 
                        ? 'border-purple-400 bg-purple-50' 
                        : 'border-dashed border-gray-400 bg-gray-50'
                    }`}
                    style={{ transitionDelay: `${idx * 100}ms` }}
                  >
                    {iconInSpace ? (
                      <div className="flex flex-col h-full p-4">
                        {/* Header con título y botón eliminar */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0 mr-4">
                            <div className="text-lg font-semibold text-gray-800 truncate">
                              {title || formatFieldName(iconInSpace.field)}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <i className={`${iconInSpace.icon}`}></i>
                              <span className="capitalize">{iconInSpace.type}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeIconFromSpace(idx)}
                            className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors flex-shrink-0 hover:scale-110 transition-transform duration-200"
                            title="Eliminar"
                          >
                            <i className="ti ti-x"></i>
                          </button>
                        </div>
                        
                        {/* Contenedor del mini gráfico */}
                        <div className="flex-1 min-h-0">
                          <div 
                            id={`dashboard-chart-${currentPage}-${idx}`} 
                            style={{ width: '100%', height: '100%', minHeight: '200px' }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-gray-500 text-lg text-center">
                          Arrastra un gráfico aquí
                          <br />
                          <span className="text-sm">Espacio {idx + 1}</span>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Vista normal (no expandida)
  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
      
      <div className="min-h-screen bg-gray-50 p-4">
        {/* Encabezado */}
        <div className="bg-white rounded-lg shadow mb-4 p-4">
          <h1 className="text-2xl font-bold">Estadísticas</h1>
          <p className="text-gray-600">UUID: {uuid}</p>
        </div>

        {formFields.length > 0 && (
          <div className="grid grid-cols-4 gap-4 h-[calc(100vh-120px)]">
            {/* CUADRANTE 1: IZQUIERDA - CONTROLES Y GRÁFICO PRINCIPAL (1 columna) */}
            <div className="bg-white rounded-lg shadow p-4 flex flex-col col-span-1">
              {/* Parte Superior (1/4): Controles */}
              <div className="h-1/4 mb-4">
                <div className="grid grid-cols-2 gap-4 h-full">
                  {/* Columna Izquierda - Campos */}
                  <div className="flex flex-col">
                    <h2 className="text-lg font-semibold mb-2">Campos</h2>
                    <div className="flex gap-1 flex-wrap overflow-y-auto max-h-20">
                      {formFields.map((f) => (
                        <button
                          key={f}
                          onClick={() => handleFieldClick(f)}
                          className={`px-2 py-1 rounded border text-xs transition-all duration-200 ${
                            selectedField === f
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          {formatFieldName(f)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Columna Derecha - Tipos de Gráficos */}
                  <div className="flex flex-col">
                    <h2 className="text-lg font-semibold mb-2">Gráficos</h2>
                    <div className="flex gap-1 flex-wrap">
                      {selectedField && getAvailableIcons().map((icon) => (
                        <button
                          key={icon.name}
                          draggable={!icon.disabled}
                          onDragStart={(e) => handleDragStart(e, { 
                            icon: icon.icon, 
                            type: icon.name, 
                            title: icon.title 
                          })}
                          onClick={() => handleIconClick(icon.name)}
                          className={`w-6 h-6 rounded flex items-center justify-center text-sm border transition-all duration-300 ${
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
                      {!selectedField && (
                        <p className="text-gray-500 text-xs">Selecciona un campo</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Parte Inferior (3/4): Gráfico Principal */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-2 text-center">
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

            {/* CUADRANTE 2: DERECHA - DASHBOARD EN TIEMPO REAL CON DRAG & DROP (3 columnas) */}
            <div className={`bg-white rounded-lg shadow p-4 col-span-3 transition-all duration-500 ${
              isAnimating ? 'opacity-0 transform -translate-x-10' : 'opacity-100 transform translate-x-0'
            }`}>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Dashboard en Tiempo Real</h2>
                <div className="flex items-center gap-2">
                  {/* Navegación de páginas */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    {dashboardPages.map((page) => (
                      <button
                        key={page.id}
                        onClick={() => changePage(page.id)}
                        className={`px-3 py-1 rounded-md text-sm transition-all duration-200 ${
                          currentPage === page.id
                            ? 'bg-white shadow-sm text-blue-600 font-medium'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {page.name}
                      </button>
                    ))}
                  </div>
                  
                  {/* Botón para añadir nueva página */}
                  <button
                    onClick={addNewPage}
                    className="w-8 h-8 flex items-center justify-center text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-all duration-300 hover:scale-110"
                    title="Añadir nueva página"
                  >
                    <i className="ti ti-plus text-lg"></i>
                  </button>

                  {/* Botón para expandir */}
                  <button
                    onClick={toggleDashboardExpanded}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-all duration-300 hover:scale-110"
                    title="Expandir dashboard"
                  >
                    <i className="ti ti-arrow-up-left text-lg"></i>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 h-[calc(100%-60px)]">
                {Array.from({ length: 4 }).map((_, idx) => {
                  const iconInSpace = draggedIcons[idx];
                  const title = availableTitles[idx];
                  
                  return (
                    <div
                      key={idx}
                      className={`border-2 rounded-lg transition-all duration-300 relative ${
                        isAnimating 
                          ? 'opacity-0 transform scale-95' 
                          : 'opacity-100 transform scale-100'
                      } ${
                        iconInSpace 
                          ? 'border-purple-400 bg-purple-50' 
                          : 'border-dashed border-gray-400 bg-gray-50 hover:bg-gray-100'
                      }`}
                      style={{ transitionDelay: `${idx * 50}ms` }}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, idx)}
                    >
                      {iconInSpace ? (
                        <div className="flex flex-col h-full p-2">
                          {/* Header con título y botón eliminar */}
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex-1 min-w-0 mr-2">
                              <div className="text-xs font-semibold text-gray-800 truncate">
                                {title || formatFieldName(iconInSpace.field)}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <i className={`${iconInSpace.icon} text-xs`}></i>
                                <span className="capitalize">{iconInSpace.type}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => removeIconFromSpace(idx)}
                              className="w-5 h-5 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-all duration-200 hover:scale-110 flex-shrink-0"
                              title="Eliminar"
                            >
                              <i className="ti ti-x text-xs"></i>
                            </button>
                          </div>
                          
                          {/* Contenedor del mini gráfico */}
                          <div className="flex-1 min-h-0 mt-1">
                            <div 
                              id={`dashboard-chart-${currentPage}-${idx}`} 
                              style={{ width: '100%', height: '100%', minHeight: '60px' }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-gray-500 text-xs text-center">
                            Arrastra un gráfico aquí
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