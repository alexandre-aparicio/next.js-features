// components/tables/columns/EstadoMhColumn.tsx
import { TableColumn } from "../types/TableColumnTypes";
import { Invoice } from "../types/Invoice";

export const EstadoMhColumn: TableColumn<Invoice> = {
  id: "estado",
  header: "Estado MH",
  sortable: true,
  render: (row) => {
    const getEstadoIcono = (estado: string) => {
      switch (estado) {
        case "PROCESADO":
          return { icon: "fas fa-check-circle" };
        case "RECHAZADO":
          return { icon: "fas fa-exclamation-triangle" };
        case "INVALIDADO":
          return { icon: "fas fa-ban" };
        case "PENDIENTE":
          return { icon: "fas fa-clock" };
        case "ERROR":
          return { icon: "fas fa-times-circle" };
        default:
          return { icon: "fas fa-question-circle" };
      }
    };

    const estadoInfo = getEstadoIcono(row.estado);

    const handleClick = () => {
      console.log(`ID de la línea: ${row.id}, Estado: ${row.estado}`);
    };

    return (
      <div style={{ 
        position: 'relative', 
        display: 'inline-block' 
      }}>
        <button 
          title={row.estado}
          onClick={handleClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s',
            fontSize: '16px',
            backgroundColor: 'transparent',
            color: '#000000'
          }}
          onMouseEnter={(e) => {
            const tooltip = e.currentTarget.nextSibling as HTMLElement;
            if (tooltip) {
              tooltip.style.opacity = '1';
              tooltip.style.visibility = 'visible';
            }
          }}
          onMouseLeave={(e) => {
            const tooltip = e.currentTarget.nextSibling as HTMLElement;
            if (tooltip) {
              tooltip.style.opacity = '0';
              tooltip.style.visibility = 'hidden';
            }
          }}
        >
          <i className={estadoInfo.icon}></i>
        </button>
        
        {/* Tooltip */}
        <div style={{
          position: 'absolute',
          zIndex: 50,
          padding: '0.5rem 0.75rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: 'white',
          backgroundColor: '#000000',
          borderRadius: '0.5rem',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          opacity: 0,
          visibility: 'hidden',
          transition: 'opacity 0.2s ease, visibility 0.2s ease',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '0.5rem'
        }}>
          {row.estado}
          <div style={{
            position: 'absolute',
            width: '8px',
            height: '8px',
            backgroundColor: '#000000',
            transform: 'rotate(45deg)',
            bottom: '-4px',
            left: '50%',
            marginLeft: '-4px'
          }}></div>
        </div>
      </div>
    );
  },
  width: "80px",
  align: "center"
};