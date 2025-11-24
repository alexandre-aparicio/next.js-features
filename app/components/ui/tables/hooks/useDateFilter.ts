// hooks/useDateFilter.ts
"use client";

import { useState, useEffect } from "react";

export type DateFilterType = "este_mes" | "mes_pasado" | "personalizado";

export interface DateRange {
  inicio: string;
  fin: string;
}

interface UseDateFilterProps {
  onDateChange?: (start: string, end: string) => void;
  initialFilter?: DateFilterType;
}

export function useDateFilter({
  onDateChange,
  initialFilter = "este_mes",
}: UseDateFilterProps = {}) {
  const [filtro, setFiltro] = useState<DateFilterType>(initialFilter);
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");

  const obtenerRangoFechas = (filterType: DateFilterType): DateRange => {
    const hoy = new Date();

    switch (filterType) {
      case "este_mes":
        return {
          inicio: new Date(hoy.getFullYear(), hoy.getMonth(), 1)
            .toISOString()
            .split("T")[0],
          fin: new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
            .toISOString()
            .split("T")[0],
        };

      case "mes_pasado":
        return {
          inicio: new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
            .toISOString()
            .split("T")[0],
          fin: new Date(hoy.getFullYear(), hoy.getMonth(), 0)
            .toISOString()
            .split("T")[0],
        };

      default:
        return { inicio: "", fin: "" };
    }
  };

  // 1️⃣ Cuando se cambia el filtro a uno automático → rellenar fechas
  useEffect(() => {
    if (filtro !== "personalizado") {
      const rango = obtenerRangoFechas(filtro);
      setFechaInicio(rango.inicio);
      setFechaFin(rango.fin);
    }
  }, [filtro]);

  // 2️⃣ Avisar al padre cuando cambien las fechas
  useEffect(() => {
    if (!onDateChange) return;

    if (filtro !== "personalizado") {
      const rango = obtenerRangoFechas(filtro);
      onDateChange(rango.inicio, rango.fin);
    } else if (fechaInicio && fechaFin) {
      onDateChange(fechaInicio, fechaFin);
    }
  }, [filtro, fechaInicio, fechaFin]);

  // 3️⃣ Limpia fechas solo cuando sales del modo personalizado
  useEffect(() => {
    if (filtro !== "personalizado") {
      setFechaInicio("");
      setFechaFin("");
    }
  }, [filtro]);

  return {
    filtro,
    fechaInicio,
    fechaFin,
    setFiltro,
    setFechaInicio,
    setFechaFin,
    obtenerRangoFechas: () => obtenerRangoFechas(filtro),
  };
}
