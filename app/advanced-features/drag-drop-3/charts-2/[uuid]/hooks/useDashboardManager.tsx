'use client';

import { useState, useEffect } from 'react';
import { DashboardPage, DashboardConfig } from '../types/types';

const DASHBOARD_STORAGE_KEY = 'dashboard-config';

export const useDashboardManager = (uuid: string | string[]) => {
  const [dashboardPages, setDashboardPages] = useState<DashboardPage[]>([
    { id: 1, name: 'Página 1', icons: [null, null, null, null], titles: ['', '', '', ''] }
  ]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isDashboardExpanded, setIsDashboardExpanded] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Función para guardar en sessionStorage
  const saveToSessionStorage = (pages: DashboardPage[]) => {
    try {
      const config: DashboardConfig = {
        uuid: uuid as string,
        pages: pages.map(page => ({
          id: page.id,
          name: page.name,
          icons: page.icons,
          titles: page.titles
        }))
      };
      sessionStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Error guardando en sessionStorage:', error);
    }
  };

  // Función para cargar desde sessionStorage
  const loadFromSessionStorage = (): boolean => {
    try {
      const saved = sessionStorage.getItem(DASHBOARD_STORAGE_KEY);
      if (saved) {
        const config: DashboardConfig = JSON.parse(saved);
        if (config.uuid === uuid) {
          setDashboardPages(config.pages);
          return true;
        }
      }
    } catch (error) {
      console.error('Error cargando desde sessionStorage:', error);
    }
    return false;
  };

  // Añadir nueva página
  const addNewPage = () => {
    const newPageId = Math.max(...dashboardPages.map(p => p.id)) + 1;
    const updatedPages: DashboardPage[] = [
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
    saveToSessionStorage(updatedPages);
  };

  // Cambiar de página
  const changePage = (pageId: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPage(pageId);
      setIsAnimating(false);
    }, 300);
  };

  // Obtener la página actual
  const currentPageData = dashboardPages.find(page => page.id === currentPage) || dashboardPages[0];
  const draggedIcons = currentPageData.icons;
  const availableTitles = currentPageData.titles;

  // Efecto para cargar configuración al montar
  useEffect(() => {
    loadFromSessionStorage();
  }, [uuid]);

  return {
    // Estados
    dashboardPages,
    currentPage,
    isDashboardExpanded,
    isAnimating,
    draggedIcons,
    availableTitles,
    
    // Setters
    setDashboardPages,
    setCurrentPage,
    setIsDashboardExpanded,
    setIsAnimating,
    
    // Funciones
    saveToSessionStorage,
    addNewPage,
    changePage
  };
};