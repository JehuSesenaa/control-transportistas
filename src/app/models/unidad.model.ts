import { Usuario } from './usuario.model';

export interface Unidad {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  usuarioId: number;
  usuario?: Usuario;
  fechaCreacion: Date;
}
