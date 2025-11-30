export interface DashboardPage {
  id: number;
  name: string;
  icons: (DashboardIcon | null)[];
  titles: string[];
}

export interface DashboardIcon {
  icon: string;
  field: string;
  type: string;
  title: string;
}

export interface DragData {
  icon: string;
  field: string;
  type: string;
  title: string;
}