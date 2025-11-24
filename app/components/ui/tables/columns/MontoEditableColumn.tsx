// columns/MontoEditableColumn.tsx
import { TableColumn } from "../types/TableColumnTypes";
import { Invoice } from "../types/Invoice";
import { PriceEdit } from "./editableColumn/PriceEdit";

export const MontoEditableColumn: TableColumn<Invoice> = {
  id: "monto",
  header: "Monto",
  sortable: true,
  editable: true,
  editComponent: PriceEdit,

  // 🔥 PASO CLAVE → pasar el valor al editComponent
  editComponentProps: (row) => ({
    value: row.monto,
  }),

  render: (row) => (
    <div className="group flex items-center justify-between">
      <span className="font-semibold text-green-600">
        ${row.monto.toFixed(2)}
      </span>
      <span 
        className="ml-2 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-help"
        title="Haz clic para editar"
      >
        ✏️
      </span>
    </div>
  ),

  width: "120px",
  align: "right" as const
};
