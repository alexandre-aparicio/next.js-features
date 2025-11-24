# Advanced Tables

Esta carpeta contiene componentes avanzados de tablas para Next.js, incluyendo:

- **GenericTableContainer**: tabla genérica con:
  - Búsqueda en columnas clave
  - Filtros de fecha
  - Ordenamiento por columnas
  - Edición en línea de celdas
  - Paginación
  - Selector de items por página
  - Contador de resultados filtrados

# Componentes de la Tabla Avanzada

- **Componentes**:  
  Todos los elementos de la tabla son reutilizables y opcionales.  

- **Columnas**:  
  Las columnas son reutilizables y con estilos predefinidos; además, se pueden crear nuevas columnas con estilos propios para componer tablas a medida, combinando columnas genéricas y específicas de cada tabla.  

- **Orden de columnas**:  
  Cada columna tiene un campo `sortable` (`true` o `false`) que determina si puede ser ordenada.

## Uso

Cada tabla se configura creando un archivo proveedor que:

1. **Importa `GenericTableContainer`** y las columnas que desea usar.
2. **Define los estados** (`rows`, `loading`, `error`) para manejar los datos de la tabla.
3. **Envuelve los handlers** (`handleCellEdit`, `fetchFacturas`, `handleDateChange`) con los estados locales, para que la tabla pueda actualizarse correctamente.
4. **Crea un arreglo de columnas (`columns`)** combinando columnas genéricas y específicas, definiendo `id`, `header`, `sortable` y `render` o componentes editables.
5. **Renderiza `GenericTableContainer`** pasando los `rows`, `columns`, `loading`, `error`, y los callbacks de edición o filtrado de fechas.
