# Advanced Tables

Esta carpeta contiene componentes avanzados de tablas para Next.js, incluyendo:

- **GenericTableContainer**: tabla genérica con:
  - Búsqueda en todas las columnas
  - Filtros de fecha
  - Ordenamiento por columnas
  - Edición en línea de celdas
  - Paginación
  - Selector de items por página
  - Contador de resultados filtrados

- **Subcomponentes**:
  - `DateFilter.tsx`
  - `SearchBox.tsx`
  - `ItemsPerPageSelector.tsx`
  - `Pagination.tsx`
  - `ResultsCounter.tsx`
  - `SortableHeader.tsx`
  - `EditableCell.tsx`

## Uso

Importar `GenericTableContainer` desde:

```ts
import GenericTableContainer from "./advanced-tables/GenericTableContainer";
