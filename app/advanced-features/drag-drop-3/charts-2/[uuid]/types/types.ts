// types/dashboard.types.ts

export interface ChartData {
  category: string;
  fullCategory: string;
  value: number;
  realPercent: string;
}

/**
 * Datos para el gráfico de árbol (TreeMap)
 */
export interface TreeMapData {
  name: string;
  children: Array<{
    name: string;
    value: number;
  }>;
}

/**
 * Configuración de un icono/tipo de gráfico disponible
 */
export interface ChartIcon {
  name: ChartType;
  icon: string;
  title: string;
  disabled?: boolean;
}

/**
 * Tipos de gráficos disponibles
 */
export type ChartType = 'bar' | 'donut' | 'tree' | 'variable' | 'semi' | 'force';

/**
 * Información de un gráfico asignado al dashboard
 */
export interface DraggedIcon {
  icon: string;
  field: string;
  type: ChartType;
  title: string;
}

/**
 * Página del dashboard con sus gráficos y títulos
 */
export interface DashboardPage {
  id: number;
  name: string;
  icons: Array<DraggedIcon | null>;
  titles: string[];
}

/**
 * Configuración del dashboard guardada en sessionStorage
 */
export interface DashboardConfig {
  uuid: string;
  pages: DashboardPage[];
}

/**
 * Props para el renderizado de mini gráficos
 */
export interface MiniChartProps {
  type: ChartType;
  data: ChartData[];
  field: string;
  containerId: string;
}

/**
 * Estructura de respuesta del formulario
 */
export interface FormResponse {
  id: string;
  form_id: string;
  user_id?: string;
  session_id: string;
  responses: Record<string, string>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

/**
 * Props para el hook useChartManager
 */
export interface UseChartManagerProps {
  uuid: string | string[];
}


export interface UseChartManagerReturn {
  loading: boolean;
  error: string;
  responses: FormResponse[];
  selectedField: string;
  formFields: string[];
  setSelectedField: (field: string) => void;
  fetchResponses: () => Promise<void>;
}