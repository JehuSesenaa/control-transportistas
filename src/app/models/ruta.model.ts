import { Unidad } from './unidad.model';

export interface Ruta {
  id: number;
  origin: string;
  destination: string;
  distance_km: number;
  estimated_time_hours: number;
  unit_id: number;
  unidad?: Unidad;
  status: 'ASIGNADA' | 'EN_RUTA' | 'COMPLETADA' | 'CANCELADA';
  assigned_at: Date;
  started_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date | null;
}

// Interfaces para las requests de la API
export interface CrearRutaRequest {
  origin: string;
  destination: string;
  distance_km: number;
  estimated_time_hours: number;
  unit_id: number;
}

export interface ActualizarRutaRequest {
  origin?: string;
  destination?: string;
  distance_km?: number;
  estimated_time_hours?: number;
  unit_id?: number;
}

export interface ActualizarEstadoRutaRequest {
  status: string;
}