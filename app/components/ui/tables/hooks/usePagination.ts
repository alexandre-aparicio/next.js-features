"use client";

import { useState, useMemo } from "react";

export function usePagination<T>(rows: T[], itemsPerPage: number) {
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(itemsPerPage);

  const totalPaginas = useMemo(() => {
    return Math.ceil(rows.length / itemsPorPagina);
  }, [rows, itemsPorPagina]);

  const paginatedData = useMemo(() => {
    const start = (paginaActual - 1) * itemsPorPagina;
    const end = start + itemsPorPagina;
    return rows.slice(start, end);
  }, [rows, paginaActual, itemsPorPagina]);

  return {
    paginaActual,
    setPaginaActual,
    itemsPorPagina,
    setItemsPorPagina,
    totalPaginas,
    paginatedData,
  };
}
