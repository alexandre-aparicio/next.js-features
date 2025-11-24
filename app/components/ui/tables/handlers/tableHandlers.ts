// handlers/tableHandlers.ts
import { Invoice } from "../types/Invoice";

// Handler para edición de celdas
export const handleCellEdit = (
  rows: Invoice[],
  setRows: React.Dispatch<React.SetStateAction<Invoice[]>>,
  row: Invoice, 
  columnId: string, 
  newValue: any
) => {
  if (columnId !== "monto") return;

  console.log(`AQUI PUEDE ACTUALIZAR API → factura ${row.id}: ${row.monto} → ${newValue}`);

  setRows((prev) =>
    prev.map((f) =>
      f.id === row.id ? { ...f, monto: newValue } : f
    )
  );
};

// Handler para fetch de facturas
export const fetchFacturas = async (
  inicio: string, 
  fin: string,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setRows: React.Dispatch<React.SetStateAction<Invoice[]>>
) => {
  const API_BASE_URL = "http://93.127.135.52:8110/api/v1/prueba-001";
  
  setLoading(true);
  setError(null);

  try {
    const res = await fetch(`${API_BASE_URL}/${inicio}/${fin}`);
    if (!res.ok) throw new Error("Error al obtener facturas");

    const data = await res.json();
    setRows(data.facturas || []);
  } catch (err: any) {
    setError(err.message);
    setRows([]);
  } finally {
    setLoading(false);
  }
};

// Handler para cambio de fecha
export const handleDateChange = (
  inicio: string, 
  fin: string,
  fetchFacturas: Function
) => {
  if (inicio && fin) fetchFacturas(inicio, fin);
};