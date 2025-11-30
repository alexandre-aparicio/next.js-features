'use client';

// Types
import { 
  ChartType, 
  ChartIcon, 
  DraggedIcon 
} from './types/types';

interface ChartControlsProps {
  selectedField: string;
  selectedIcon: ChartType;
  formFields: string[];
  availableIcons: ChartIcon[];
  formatFieldName: (field: string) => string;
  onFieldClick: (field: string) => void;
  onIconClick: (iconName: ChartType) => void;
  onDragStart: (e: React.DragEvent, iconData: Omit<DraggedIcon, 'field'>) => void;
}

export default function ChartControls({
  selectedField,
  selectedIcon,
  formFields,
  availableIcons,
  formatFieldName,
  onFieldClick,
  onIconClick,
  onDragStart
}: ChartControlsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col col-span-1">
      {/* Parte Superior (1/4): Controles */}
      <div className="h-1/4 mb-4">
        <div className="grid grid-cols-2 gap-4 h-full">
          {/* Columna Izquierda - Campos */}
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Campos</h2>
            <div className="flex gap-1 flex-wrap overflow-y-auto max-h-20">
              {formFields.map((f) => (
                <button
                  key={f}
                  onClick={() => onFieldClick(f)}
                  className={`px-2 py-1 rounded border text-xs transition-all duration-200 ${
                    selectedField === f
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {formatFieldName(f)}
                </button>
              ))}
            </div>
          </div>

          {/* Columna Derecha - Tipos de Gráficos */}
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Gráficos</h2>
            <div className="flex gap-1 flex-wrap">
              {selectedField && availableIcons.map((icon) => (
                <button
                  key={icon.name}
                  draggable={!icon.disabled}
                  onDragStart={(e) => onDragStart(e, { 
                    icon: icon.icon, 
                    type: icon.name, 
                    title: icon.title 
                  })}
                  onClick={() => onIconClick(icon.name)}
                  className={`w-6 h-6 rounded flex items-center justify-center text-sm border transition-all duration-300 ${
                    icon.disabled 
                      ? 'cursor-not-allowed opacity-30 border-gray-200 bg-gray-100 text-gray-400' 
                      : selectedIcon === icon.name 
                        ? 'border-blue-500 bg-blue-100 text-blue-600 cursor-pointer' 
                        : 'border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-grab active:cursor-grabbing hover:scale-105'
                  }`}
                  title={icon.disabled ? `${icon.title} (Ya asignado)` : icon.title}
                  disabled={icon.disabled}
                >
                  <i className={icon.icon}></i>
                </button>
              ))}
              {!selectedField && (
                <p className="text-gray-500 text-xs">Selecciona un campo</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Parte Inferior (3/4): Gráfico Principal */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold mb-2 text-center">
          {selectedField ? `Distribución: ${formatFieldName(selectedField)}` : 'Selecciona un campo'}
        </h2>
        <div className="flex items-center justify-center h-[calc(100%-40px)]">
          {selectedField ? (
            <div className="w-full h-full">
              {selectedIcon === 'bar' && <div id="chartdiv2" style={{ width: '100%', height: '100%' }} />}
              {selectedIcon === 'donut' && <div id="chartdiv" style={{ width: '100%', height: '100%' }} />}
              {selectedIcon === 'tree' && <div id="treemapdiv" style={{ width: '100%', height: '100%' }} />}
              {selectedIcon === 'variable' && <div id="radiusPiediv" style={{ width: '100%', height: '100%' }} />}
              {selectedIcon === 'semi' && <div id="chartSemiCircle" style={{ width: '100%', height: '100%' }} />}
              {selectedIcon === 'force' && <div id="chartForceDirected" style={{ width: '100%', height: '100%' }} />}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-lg w-full">
              <span className="text-gray-400">Selecciona un campo para ver el gráfico</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}