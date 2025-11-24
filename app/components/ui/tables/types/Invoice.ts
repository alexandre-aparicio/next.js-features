export interface Invoice {
  id: number;
  numeroFactura: string;
  cliente: string;
  fecha: string;
  monto: number;
  estado: "PENDIENTE" | "PROCESADO" | "RECHAZADO" | "INVALIDADO";
  tipoDte: string;
}

export interface ApiResponse {
  fechainicio: string;
  fechafin: string;
  total_facturas: number;
  facturas: Invoice[];
}