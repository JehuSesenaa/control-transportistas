import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, combineLatest, of } from 'rxjs';
import { skip, take } from 'rxjs/operators';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Performance, CrearPerformanceRequest, ActualizarPerformanceRequest } from '../models/performance.model';
import { RutaService } from './ruta.service';

interface PerformanceApiResponse {
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
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private apiUrl = `${environment.apiUrl}/performance`;
  private performancesSubject = new BehaviorSubject<Performance[]>([]);
  public performances$ = this.performancesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private rutaService: RutaService
  ) {
    this.loadPerformances();
    this.rutaService.rutas$.pipe(skip(1)).subscribe(() => {
      this.updateRutaRelations();
    });
  }

  private updateRutaRelations(): void {
    const performancesActuales = this.performancesSubject.value;

    this.rutaService.rutas$.pipe(take(1)).subscribe((rutasActuales: any[]) => {
      const performancesActualizadas = performancesActuales.map(performance => {
        if (performance.route_id && rutasActuales.length > 0) {
          performance.ruta = rutasActuales.find((r: any) => r.id === performance.route_id);
        }
        return performance;
      });

      this.performancesSubject.next(performancesActualizadas);
    });
  }

  private loadPerformances(): void {
    combineLatest([
      this.http.get<PerformanceApiResponse[]>(this.apiUrl).pipe(
        catchError(error => {
          if (error.status === 404) {
            return of([] as PerformanceApiResponse[]);
          }
          return this.handleError(error);
        })
      ),
      this.rutaService.rutas$
    ]).subscribe({
      next: ([performancesApi, rutas]) => {
        const performancesMapeadas = performancesApi.map(performanceApi => {
          const performance = this.mapApiToPerformance(performanceApi);
          if (performance.route_id && rutas.length > 0) {
            performance.ruta = rutas.find(r => r.id === performance.route_id);
          }
          return performance;
        });
        this.performancesSubject.next(performancesMapeadas);
      },
      error: (error) => console.error('Error cargando performances:', error)
    });
  }

  getPerformances(): Observable<Performance[]> {
    return this.performances$;
  }

  getPerformanceById(id: number): Observable<Performance> {
    return combineLatest([
      this.http.get<PerformanceApiResponse>(`${this.apiUrl}/${id}`),
      this.rutaService.rutas$
    ]).pipe(
      map(([apiPerformance, rutas]) => {
        const performance = this.mapApiToPerformance(apiPerformance);
        if (performance.route_id && rutas.length > 0) {
          performance.ruta = rutas.find(r => r.id === performance.route_id);
        }
        return performance;
      }),
      catchError(this.handleError)
    );
  }

  crearPerformance(performance: CrearPerformanceRequest): Observable<Performance> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<PerformanceApiResponse>(this.apiUrl, performance, { headers }).pipe(
      map(apiPerformance => {
        const nuevaPerformance = this.mapApiToPerformance(apiPerformance);
        return nuevaPerformance;
      }),
      tap((nuevaPerformance) => {
        const performancesActuales = this.performancesSubject.value;
        this.performancesSubject.next([...performancesActuales, nuevaPerformance]);
        if (nuevaPerformance.route_id) {
          this.rutaService.rutas$.pipe(take(1)).subscribe(rutas => {
            if (rutas.length > 0) {
              nuevaPerformance.ruta = rutas.find((r: any) => r.id === nuevaPerformance.route_id);
            }
          });
        }
      }),
      tap((nuevaPerformance) => {
        // Actualizar el BehaviorSubject
        const performancesActuales = this.performancesSubject.value;
        this.performancesSubject.next([...performancesActuales, nuevaPerformance]);

        // Asignar la ruta si existe
        if (nuevaPerformance.route_id) {
          this.rutaService.rutas$.pipe(take(1)).subscribe(rutas => {
            if (rutas.length > 0) {
              nuevaPerformance.ruta = rutas.find((r: any) => r.id === nuevaPerformance.route_id);
            }
          });
        }
      }),
      catchError(error => {
        if (error.status === 404) {
          console.error('Endpoint /performances no encontrado. Verifica que esté implementado en el backend.');
          return throwError(() => new Error('El endpoint de rendimiento no está disponible. Contacta al administrador.'));
        }
        return this.handleError(error);
      })
    );
  }

  actualizarPerformance(id: number, performance: ActualizarPerformanceRequest): Observable<Performance> {
    return combineLatest([
      this.http.patch<PerformanceApiResponse>(`${this.apiUrl}/${id}`, performance),
      this.rutaService.rutas$
    ]).pipe(
      map(([apiPerformance, rutas]) => {
        const performanceActualizada = this.mapApiToPerformance(apiPerformance);
        if (performanceActualizada.route_id && rutas.length > 0) {
          performanceActualizada.ruta = rutas.find(r => r.id === performanceActualizada.route_id);
        }
        return performanceActualizada;
      }),
      tap((performanceActualizada) => {
        const performancesActuales = this.performancesSubject.value;
        const index = performancesActuales.findIndex(p => p.id === id);
        if (index !== -1) {
          performancesActuales[index] = performanceActualizada;
          this.performancesSubject.next([...performancesActuales]);
        }
      }),
      catchError(this.handleError)
    );
  }

  eliminarPerformance(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const performancesActuales = this.performancesSubject.value;
        const performancesFiltradas = performancesActuales.filter(p => p.id !== id);
        this.performancesSubject.next(performancesFiltradas);
      }),
      catchError(this.handleError)
    );
  }
  private mapApiToPerformance(apiPerformance: PerformanceApiResponse): Performance {
    return {
      id: apiPerformance.id,
      route_id: apiPerformance.route_id,
      distance_traveled_km: apiPerformance.distance_traveled_km,
      fuel_consumed_liters: apiPerformance.fuel_consumed_liters,
      actual_time_hours: apiPerformance.actual_time_hours,
      average_speed_kmh: apiPerformance.average_speed_kmh,
      efficiency_score: apiPerformance.efficiency_score,
      fuel_efficiency_km_per_liter: apiPerformance.fuel_efficiency_km_per_liter,
      time_efficiency: apiPerformance.time_efficiency,
      notes: apiPerformance.notes,
      recorded_at: new Date(apiPerformance.recorded_at),
      created_at: new Date(apiPerformance.created_at),
      updated_at: new Date(apiPerformance.updated_at)
    };
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código ${error.status}: ${error.message}`;
    }

    console.error('Error en la API:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}