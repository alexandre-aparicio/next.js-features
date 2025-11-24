"use client";

interface ResultsCounterProps {
  total: number;
  filtradas: number;
  paginaActual?: number;
  totalPaginas?: number;
  busqueda?: string;
}

export default function ResultsCounter({
  total,
  filtradas,
  paginaActual,
  totalPaginas,
  busqueda
}: ResultsCounterProps) {
  return (
    <div style={{ marginTop: '10px', fontSize: '14px', textAlign: 'center' }}>
      Mostrando {filtradas} de {total} facturas
      {busqueda && ` (filtradas por: "${busqueda}")`}
      {totalPaginas && totalPaginas > 1 && ` - Página ${paginaActual} de ${totalPaginas}`}
    </div>
  );
}