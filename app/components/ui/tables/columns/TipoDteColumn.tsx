// components/tables/columns/TipoDteColumn.tsx
import { TableColumn } from "../types/TableColumnTypes";
import { Invoice } from "../types/Invoice";

export const TipoDteColumn: TableColumn<Invoice> = {
  id: "tipoDte",
  header: "Tipo DTE",
  sortable: true,
  render: (row) => {
    let text = "";
    let backgroundColor = "";
    let color = "";
    let border = "";

    switch (row.tipoDte) {
      case "01":
        text = "Consumidor Final";
        backgroundColor = "#f5f5f5";
        color = "#404040";
        border = "1px solid #d4d4d4";
        break;
      case "03":
        text = "Crédito Fiscal";
        backgroundColor = "#e5e5e5";
        color = "#525252";
        border = "1px solid #a3a3a3";
        break;
      case "07":
        text = "Comprobante Retención";
        backgroundColor = "#d4d4d4";
        color = "#404040";
        border = "1px solid #737373";
        break;
      case "08":
        text = "Comprobante Liquidación";
        backgroundColor = "#f5f5f5";
        color = "#525252";
        border = "1px solid #d4d4d4";
        break; 
      case "11":
        text = "Factura Exportación";
        backgroundColor = "#e5e5e5";
        color = "#404040";
        border = "1px solid #a3a3a3";
        break;  
      case "14":
        text = "Sujeto Excluido";
        backgroundColor = "#d4d4d4";
        color = "#525252";
        border = "1px solid #737373";
        break; 
      case "15":
        text = "Comprobante Donación";
        backgroundColor = "#f5f5f5";
        color = "#404040";
        border = "1px solid #d4d4d4";
        break;  
      case "05":
        text = "Nota de Crédito";
        backgroundColor = "#a3a3a3";
        color = "#ffffff";
        border = "1px solid #737373";
        break;  
      case "06":
        text = "Nota de Débito";
        backgroundColor = "#737373";
        color = "#ffffff";
        border = "1px solid #525252";
        break; 
      case "04":
        text = "Nota de Remisión";
        backgroundColor = "#8a8a8a";
        color = "#ffffff";
        border = "1px solid #666666";
        break;  
      case "09":
        text = "Doc. Cont. Liquidacion";
        backgroundColor = "#8a8a8a";
        color = "#ffffff";
        border = "1px solid #666666";
        break;                                               
      default:
        text = "Otro";
        backgroundColor = "#f5f5f5";
        color = "#737373";
        border = "1px solid #d4d4d4";
    }

    return (
      <div style={{ 
        padding: '2px 4px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500',
        display: 'inline-block',
        backgroundColor,
        color,
        border,
        textAlign: 'center' as const,
        minWidth: '120px'
      }}>
        {text}
      </div>
    );
  },
  width: "150px",
  align: "center"
};