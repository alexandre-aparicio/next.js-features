"use client";

import { useState, useMemo } from "react";
import { SortConfig } from "../types/TableColumnTypes";

export function useSorting<T>(rows: T[]) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);

  const handleSort = (key: keyof T | string) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" };
      }

      switch (current.direction) {
        case "asc":
          return { key, direction: "desc" };
        case "desc":
          return { key, direction: "none" };
        default:
          return null;
      }
    });
  };

  const sortedRows = useMemo(() => {
    if (!sortConfig || sortConfig.direction === "none") return rows;

    const sorted = [...rows];

    sorted.sort((a, b) => {
      const aVal = a[sortConfig.key as keyof T];
      const bVal = b[sortConfig.key as keyof T];

      // Strings
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      // Numbers
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc"
          ? aVal - bVal
          : bVal - aVal;
      }

      // Otros tipos → casteo a string
      const aStr = String(aVal ?? "");
      const bStr = String(bVal ?? "");

      return sortConfig.direction === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    return sorted;
  }, [rows, sortConfig]);

  return {
    sortConfig,
    sortedRows,
    handleSort,
  };
}
