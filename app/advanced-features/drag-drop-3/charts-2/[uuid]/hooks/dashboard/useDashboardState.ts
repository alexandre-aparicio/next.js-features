import { useState, useCallback } from 'react';
import { DashboardPage } from "../../types/dashboard.types";

export const useDashboardState = (initialPages: DashboardPage[] = []) => {
  const [dashboardPages, setDashboardPages] = useState<DashboardPage[]>(initialPages);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const addNewPage = useCallback(() => {
    const newPageId = Math.max(...dashboardPages.map(p => p.id), 0) + 1;
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
    return updatedPages;
  }, [dashboardPages]);

  const removePage = useCallback((pageId: number) => {
    if (dashboardPages.length > 1) {
      const updatedPages = dashboardPages.filter(page => page.id !== pageId);
      setDashboardPages(updatedPages);
      
      if (currentPage === pageId) {
        setCurrentPage(updatedPages[0].id);
      }
      return updatedPages;
    }
    return dashboardPages;
  }, [dashboardPages, currentPage]);

  const changePage = useCallback((pageId: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPage(pageId);
      setIsAnimating(false);
    }, 300);
  }, []);

  return {
    dashboardPages,
    setDashboardPages,
    currentPage,
    setCurrentPage,
    isAnimating,
    setIsAnimating,
    addNewPage,
    removePage,
    changePage
  };
};