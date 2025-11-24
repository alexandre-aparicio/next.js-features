// components/tables/columns/ClienteColumn.tsx
import { TableColumn } from "../../types/TableColumnTypes";
import { Invoice } from "../../types/Invoice";

export const ClienteColumn: TableColumn<Invoice> = {
  id: "cliente",
  header: "Cliente",
  sortable: true, // ← Habilitar ordenamiento
  render: (row) => {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        fontSize: '14px',
        fontWeight: '600',
        color: '#059669',
        padding: '4px 0'
      }}>
        {row.cliente}
      </div>
    );
  },
  width: "200px"
};