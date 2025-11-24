// components/tables/columns/TipoDteColumn.tsx
import { TableColumn } from "../../types/TableColumnTypes";
import { Invoice } from "../../types/Invoice";

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
        backgroundColor = "#DCFCE7";
        color = "#166534";
        border = "1px solid #86EFAC";
        break;
      case "03":
        text = "Crédito Fiscal";
        backgroundColor = "#DBEAFE";
        color = "#1E40AF";
        border = "1px solid #93C5FD";
        break;
      case "07":
        text = "Comprobante Retención";
        backgroundColor = "#F3E8FF";
        color = "#7E22CE";
        border = "1px solid #C084FC";
        break;
      case "08":
        text = "Comprobante Liquidación";
        backgroundColor = "#FEF9C3";
        color = "#854D0E";
        border = "1px solid #FDE047";
        break; 
      case "11":
        text = "Factura Exportación";
        backgroundColor = "#FCE7F3";
        color = "#BE185D";
        border = "1px solid #F9A8D4";
        break;  
      case "14":
        text = "Sujeto Excluido";
        backgroundColor = "#FFEDD5";
        color = "#9A3412";
        border = "1px solid #FDBA74";
        break; 
      case "15":
        text = "Comprobante Donación";
        backgroundColor = "#E0E7FF";
        color = "#3730A3";
        border = "1px solid #A5B4FC";
        break;  
      case "05":
        text = "Nota de Crédito";
        backgroundColor = "#0b98b1ff";
        color = "white";
        border = "1px solid #b8fcfc";
        break;  
      case "06":
        text = "Nota de Débito";
        backgroundColor = "#58b3c7";
        color = "white";
        border = "1px solid #b8fcfc";
        break; 
      case "04":
        text = "Nota de Remisión";
        backgroundColor = "#7ad4e4";
        color = "white";
        border = "1px solid #b8fcfc";
        break;  
      case "09":
        text = "Doc. Cont. Liquidacion";
        backgroundColor = "#7ad4e4";
        color = "white";
        border = "1px solid #b8fcfc";
        break;                                               
      default:
        text = "Otro";
        backgroundColor = "#F3F4F6";
        color = "#374151";
        border = "1px solid #D1D5DB";
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