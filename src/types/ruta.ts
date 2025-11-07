
export type Ruta = {
  id: string;
  nombre: string;
  descripcion: string;
  distancia: number;
  dificultad: 'Fácil' | 'Intermedia' | 'Difícil';
  precio: number;
  creadorId: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  created_at: string;
};

export type RutaInsert = Omit<Ruta, 'id' | 'created_at'>;
export type RutaUpdate = Partial<RutaInsert>;
