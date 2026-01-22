export interface Performance {
  id: number;
  route_id: number;
  distance_traveled_km: number;
  fuel_consumed_liters: number;
  actual_time_hours: number;
  average_speed_kmh: number;
  efficiency_score: number;
  fuel_efficiency_km_per_liter: number;
  time_efficiency: number;
  notes: string;
  recorded_at: Date;
  created_at: Date;
  updated_at: Date;
  ruta?: any; // Relación con la ruta
}

// Interfaces para las requests de la API
export interface CrearPerformanceRequest {
  route_id: number;
  distance_traveled_km: number;
  fuel_consumed_liters: number;
  actual_time_hours: number;
  notes?: string;
}

export interface ActualizarPerformanceRequest {
  distance_traveled_km?: number;
  fuel_consumed_liters?: number;
  actual_time_hours?: number;
  notes?: string;
}