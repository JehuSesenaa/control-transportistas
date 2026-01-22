import { Usuario } from './usuario.model';

export interface Unidad {
  id: number;
  license_plate: string;
  brand: string;
  model: string;
  year: number;
  capacity: number;
  user_id: number;
  is_active: boolean;
  usuario?: Usuario;
  created_at: Date;
  updated_at: Date;
}
