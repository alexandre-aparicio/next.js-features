// components/tables/columns/FechaColumn.tsx
import { TableColumn } from "../../types/TableColumnTypes";
import { Invoice } from "../../types/Invoice";

export const FechaColumn: TableColumn<Invoice> = {
  id: "fecha",
  header: "Fecha",
  sortable: true,
  render: (row) => {

    const formatDate = (dateString: string) => {
      try {
        const date = new Date(dateString);

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      } catch (error) {


        return dateString;
      }
    };

    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        fontSize: '14px',
        fontWeight: '600',
        color: '#b67219ff', 
        padding: '4px 0'
      }}>
        {formatDate(row.fecha)}
      </div>
    );
  },
  width: "200px"
};