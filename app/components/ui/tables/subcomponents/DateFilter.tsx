"use client";

interface DateFilterProps {
  filtro: DateFilterType;
  fechaInicio: string;
  fechaFin: string;
  onFiltroChange: (filtro: DateFilterType) => void;
  onFechaInicioChange: (fecha: string) => void;
  onFechaFinChange: (fecha: string) => void;
}

export type DateFilterType = "este_mes" | "mes_pasado" | "personalizado";

export default function DateFilter({
  filtro,
  fechaInicio,
  fechaFin,
  onFiltroChange,
  onFechaInicioChange,
  onFechaFinChange,
}: DateFilterProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center space-x-3">
        <span className="text-gray-600">Mostrar:</span>

        <select
          value={filtro}
          onChange={(e) => onFiltroChange(e.target.value as DateFilterType)}
          className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
        >
          <option value="este_mes">Este Mes</option>
          <option value="mes_pasado">Mes Pasado</option>
          <option value="personalizado">Fecha Personalizada</option>
        </select>
      </div>

      {filtro === "personalizado" && (
        <div className="flex space-x-3 mt-3">
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => onFechaInicioChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
          />

          <input
            type="date"
            value={fechaFin}
            onChange={(e) => onFechaFinChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
          />
        </div>
      )}
    </div>
  );
}
