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
    <div>
      <div className="flex items-center">
        <span>Mostrar:</span>
        <select
          value={filtro}
          onChange={(e) => onFiltroChange(e.target.value as DateFilterType)}
          className="border px-2 py-1"
        >
          <option value="este_mes">Este Mes</option>
          <option value="mes_pasado">Mes Pasado</option>
          <option value="personalizado">Fecha Personalizada</option>
        </select>
      </div>

      {filtro === "personalizado" && (
        <div className="flex mt-2">
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => onFechaInicioChange(e.target.value)}
            className="border px-2 py-1"
          />
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => onFechaFinChange(e.target.value)}
            className="border px-2 py-1"
          />
        </div>
      )}
    </div>
  );
}