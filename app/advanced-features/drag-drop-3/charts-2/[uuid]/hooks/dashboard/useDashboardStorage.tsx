import { useCallback } from 'react';
import { DashboardPage, DashboardStorage } from '../../types/dashboard.types';

const DASHBOARD_STORAGE_KEY = 'dashboard-config';

export const useDashboardStorage = (uuid: string) => {
  const saveToSessionStorage = useCallback((pages: DashboardPage[]) => {
    try {
      const config: DashboardStorage = {
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
    } catch (error) {
      console.error('Error guardando en sessionStorage:', error);
    }
  }, [uuid]);

  const loadFromSessionStorage = useCallback((): DashboardPage[] | null => {
    try {
      const saved = sessionStorage.getItem(DASHBOARD_STORAGE_KEY);
      if (saved) {
        const config: DashboardStorage = JSON.parse(saved);
        if (config.uuid === uuid) {
          console.log('Dashboard cargado desde sessionStorage');
          return config.pages;
        }
      }
    } catch (error) {
      console.error('Error cargando desde sessionStorage:', error);
    }
    return null;
  }, [uuid]);

  return {
    saveToSessionStorage,
    loadFromSessionStorage
  };
};