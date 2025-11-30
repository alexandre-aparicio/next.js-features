import { DashboardPage } from "../../types/dashboard.types";
import DashboardGrid from './DashboardGrid';

interface DashboardExpandedProps {
  uuid: string;
  currentPage: number;
  dashboardPages: DashboardPage[];
  isAnimating: boolean;
  onToggleExpanded: () => void;
  onRemoveIcon: (index: number) => void;
  formatFieldName: (field: string) => string;
}

export default function DashboardExpanded({
  uuid,
  currentPage,
  dashboardPages,
  isAnimating,
  onToggleExpanded,
  onRemoveIcon,
  formatFieldName
}: DashboardExpandedProps) {
  const currentPageData = dashboardPages.find(page => page.id === currentPage) || dashboardPages[0];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className={`bg-white rounded-lg shadow mb-4 p-4 flex justify-between items-center transition-all duration-500 ${
        isAnimating ? 'opacity-0 transform -translate-y-10' : 'opacity-100 transform translate-y-0'
      }`}>
        <div>
          <h1 className="text-2xl font-bold">Dashboard en Tiempo Real</h1>
          <p className="text-gray-600">UUID: {uuid}</p>
        </div>
        <button
          onClick={onToggleExpanded}
          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-300 hover:scale-110"
          title="Minimizar dashboard"
        >
          <i className="ti ti-x text-xl"></i>
        </button>
      </div>

      {/* Dashboard Grid */}
      <div className={`bg-white rounded-lg shadow p-6 transition-all duration-700 ${
        isAnimating ? 'opacity-0 transform scale-95 translate-y-10' : 'opacity-100 transform scale-100 translate-y-0'
      }`}>
        <DashboardGrid
          currentPage={currentPage}
          pageData={currentPageData}
          isAnimating={isAnimating}
          onRemoveIcon={onRemoveIcon}
          formatFieldName={formatFieldName}
          expanded={true}
        />
      </div>
    </div>
  );
}