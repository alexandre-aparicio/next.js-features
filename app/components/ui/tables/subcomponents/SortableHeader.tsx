// components/tables/SortableHeader.tsx
import { SortDirection } from "../types/TableColumnTypes";

interface SortableHeaderProps {
  label: string;
  sortDirection: SortDirection;
  onSort: () => void;
  sortable?: boolean;
}

export default function SortableHeader({ 
  label, 
  sortDirection, 
  onSort, 
  sortable = true 
}: SortableHeaderProps) {
  if (!sortable) {
    return <span>{label}</span>;
  }

  const getSortIcon = () => {
    switch (sortDirection) {
      case 'asc':
        return <i className="fas fa-sort-up"></i>;
      case 'desc':
        return <i className="fas fa-sort-down"></i>;
      default:
        return <i className="fas fa-sort"></i>;
    }
  };

  return (
    <button 
      onClick={onSort}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: '600',
        color: '#495057'
      }}
    >
      <span>{label}</span>
      <span style={{ fontSize: '12px' }}>{getSortIcon()}</span>
    </button>
  );
}