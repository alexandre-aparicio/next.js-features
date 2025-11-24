"use client";

interface PaginationProps {
  paginaActual: number;
  totalPaginas: number;
  onPageChange: (pagina: number) => void;
}

export default function Pagination({
  paginaActual,
  totalPaginas,
  onPageChange
}: PaginationProps) {
  if (totalPaginas <= 1) return null;

  const cambiarPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      onPageChange(pagina);
    }
  };

  const generarNumerosPagina = () => {
    const paginas = [];
    const paginasAMostrar = 5;
    
    let inicio = Math.max(1, paginaActual - 2);
    let fin = Math.min(totalPaginas, inicio + paginasAMostrar - 1);
    
    if (fin - inicio + 1 < paginasAMostrar) {
      inicio = Math.max(1, fin - paginasAMostrar + 1);
    }
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    return paginas;
  };

  return (
    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
      <button 
        onClick={() => cambiarPagina(paginaActual - 1)}
        disabled={paginaActual === 1}
        style={{ 
          padding: '5px 10px', 
          border: '1px solid #ccc', 
          backgroundColor: paginaActual === 1 ? '#f5f5f5' : 'white',
          cursor: paginaActual === 1 ? 'not-allowed' : 'pointer'
        }}
      >
        Anterior
      </button>

      {generarNumerosPagina().map(pagina => (
        <button
          key={pagina}
          onClick={() => cambiarPagina(pagina)}
          style={{ 
            padding: '5px 10px', 
            border: '1px solid #ccc', 
            backgroundColor: pagina === paginaActual ? '#007bff' : 'white',
            color: pagina === paginaActual ? 'white' : 'black'
          }}
        >
          {pagina}
        </button>
      ))}

      <button 
        onClick={() => cambiarPagina(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        style={{ 
          padding: '5px 10px', 
          border: '1px solid #ccc', 
          backgroundColor: paginaActual === totalPaginas ? '#f5f5f5' : 'white',
          cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer'
        }}
      >
        Siguiente
      </button>
    </div>
  );
}