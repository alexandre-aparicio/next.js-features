"use client";

import { useState, useMemo, useEffect } from "react";
import { TableColumn } from "./types/TableColumnTypes";
import DateFilter from "./subcomponents/DateFilter";
import SearchBox from "./subcomponents/SearchBox";
import ItemsPerPageSelector from "./subcomponents/ItemsPerPageSelector";
import Pagination from "./subcomponents/Pagination";
import ResultsCounter from "./subcomponents/ResultsCounter";
import SortableHeader from "./subcomponents/SortableHeader";
import { EditableCell } from "./subcomponents/EditableCell";

import { useSorting } from "./hooks/useSorting";
import { usePagination } from "./hooks/usePagination";
import { useDateFilter } from "./hooks/useDateFilter";  
import { useTableEditing } from "./hooks/useTableEditing";

interface GenericTableContainerProps<T> {
  rows: T[];
  columns: TableColumn<T>[];
  loading: boolean;
  error: string | null;
  enableDateFilter?: boolean;
  onDateChange?: (start: string, end: string) => void;
  title?: string;
  onCellEdit?: (row: T, columnId: string, value: any) => void;
}

export default function GenericTableContainer<T extends { id: number }>({
  rows,
  columns,
  loading,
  error,
  enableDateFilter = false,
  onDateChange,
  title = "All Email Performance",
  onCellEdit
}: GenericTableContainerProps<T>) {

  const [busqueda, setBusqueda] = useState("");
  const [internalRows, setInternalRows] = useState(rows);

  useEffect(() => {
    setInternalRows(rows);
  }, [rows]);

  const {
    filtro,
    fechaInicio,
    fechaFin,
    setFiltro,
    setFechaInicio,
    setFechaFin,
    obtenerRangoFechas
  } = useDateFilter({
    onDateChange,        
    initialFilter: "este_mes",
  });

  const {
    editing,
    startEditing,
    stopEditing,
    isEditing,
  } = useTableEditing<T>();

  const { sortConfig, sortedRows, handleSort } = useSorting(internalRows);

  const filteredAndSorted = useMemo(() => {
    let result = [...sortedRows];

    if (busqueda.trim()) {
      const term = busqueda.toLowerCase();
      result = result.filter((row: any) =>
        Object.values(row).some((value) =>
          value?.toString().toLowerCase().includes(term)
        )
      );
    }

    return result;
  }, [sortedRows, busqueda]);

  const handleCellEdit = (row: T, columnId: string, newValue: any) => {
    setInternalRows(prev => 
      prev.map(item => 
        item.id === row.id ? { ...item, [columnId]: newValue } : item
      )
    );
    onCellEdit?.(row, columnId, newValue);
    stopEditing();
  };

  const {
    paginaActual,
    setPaginaActual,
    itemsPorPagina,
    setItemsPorPagina,
    totalPaginas,
    paginatedData,
  } = usePagination(filteredAndSorted, 10);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, sortConfig, itemsPorPagina]);

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4">
        <h6 className="text-lg font-semibold mb-2 lg:mb-0">{title}</h6>

        <div className="flex flex-col lg:flex-row lg:items-center gap-2">
          {enableDateFilter && (
            <DateFilter
              filtro={filtro}
              fechaInicio={fechaInicio}
              fechaFin={fechaFin}
              onFiltroChange={setFiltro}
              onFechaInicioChange={setFechaInicio}
              onFechaFinChange={setFechaFin}
            />
          )}

          <SearchBox
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            placeholder="Buscar..."
          />

          <ItemsPerPageSelector
            itemsPorPagina={itemsPorPagina}
            onItemsPorPaginaChange={(n) => {
              setItemsPorPagina(n);
              setPaginaActual(1);
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  {columns.map((col) => (
                    <th key={String(col.id)} className="px-3 py-2 text-left">
                      <SortableHeader
                        label={col.header}
                        sortable={col.sortable}
                        sortDirection={
                          sortConfig?.key === col.id ? sortConfig.direction : "none"
                        }
                        onSort={() => handleSort(col.id)}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, idx) => (
                  <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                    {columns.map((col) => {
                      const cellValue = row[col.id as keyof T];
                      const isEditingCell = isEditing(row, String(col.id));
                      return (
                        <td key={String(col.id)} className="px-3 py-2">
                          {col.editable ? (
                            <EditableCell
                              value={cellValue}
                              row={row}
                              columnId={String(col.id)}
                              isEditing={isEditingCell}
                              onStartEdit={() => startEditing(row, String(col.id), cellValue)}
                              onSave={(newValue) => handleCellEdit(row, String(col.id), newValue)}
                              onCancel={stopEditing}
                              editComponent={col.editComponent}
                            />
                          ) : (
                            col.render(row)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col lg:flex-row lg:justify-between mt-4 gap-2">
            <Pagination
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              onPageChange={setPaginaActual}
            />
            <ResultsCounter
              total={internalRows.length}
              filtradas={filteredAndSorted.length}
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              busqueda={busqueda}
            />
          </div>
        </>
      )}
    </div>
  );
}
