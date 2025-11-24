"use client";

import { useState, useEffect } from "react";
import GenericTableContainer from "@/app/components/ui/tables/GenericTableContainer";
import { TableColumn } from "@/app/components/ui/tables/types/TableColumnTypes";
import { Invoice } from "@/app/components/ui/tables/types/Invoice";

import { ClienteColumn } from "@/app/components/ui/tables/columns/ClienteColumn";
import { FechaColumn } from "@/app/components/ui/tables/columns/FechaColumn";
import { TipoDteColumn } from "@/app/components/ui/tables/columns/TipoDteColumn";
import { EstadoMhColumn } from "@/app/components/ui/tables/columns/EstadoMhColumn";
import { MontoEditableColumn } from "@/app/components/ui/tables/columns/MontoEditableColumn";

import { 
  handleCellEdit, 
  fetchFacturas, 
  handleDateChange 
} from "@/app/components/ui/tables/handlers/tableHandlers";

export default function InvoiceTableProvider() {
  const [rows, setRows] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wrap handlers con los estados actuales
  const handleCellEditWrapper = (row: Invoice, columnId: string, newValue: any) => {
    handleCellEdit(rows, setRows, row, columnId, newValue);
  };

  const fetchFacturasWrapper = (inicio: string, fin: string) => {
    fetchFacturas(inicio, fin, setLoading, setError, setRows);
  };

  const handleDateChangeWrapper = (inicio: string, fin: string) => {
    handleDateChange(inicio, fin, fetchFacturasWrapper);
  };

  const columns: TableColumn<Invoice>[] = [

    { id: "numeroFactura", header: "Número", sortable: false, render: (r) => r.numeroFactura },
    ClienteColumn,
    FechaColumn,
    MontoEditableColumn,
    EstadoMhColumn,
    TipoDteColumn,
  ];

  return (
    <GenericTableContainer
      rows={rows}
      columns={columns}
      loading={loading}
      error={error}
      enableDateFilter={true}
      onDateChange={handleDateChangeWrapper}
      onCellEdit={handleCellEditWrapper}
      title="Listado de Facturas"
    />
  );
}