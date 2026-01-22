import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, combineLatest, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Ruta, CrearRutaRequest, ActualizarRutaRequest, ActualizarEstadoRutaRequest } from '../models/ruta.model';
import { UnidadService } from './unidad.service';

interface RutaApiResponse {
  id: number;
  origin: string;
  destination: string;
  distance_km: number;
  estimated_time_hours: number;
  unit_id: number;
  status: 'ASIGNADA' | 'EN_RUTA' | 'COMPLETADA' | 'CANCELADA';
  assigned_at: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class RutaService {
  private apiUrl = `${environment.apiUrl}/routes`;
  private rutasSubject = new BehaviorSubject<Ruta[]>([]);
  public rutas$ = this.rutasSubject.asObservable();

  constructor(
    private http: HttpClient,
    private unidadService: UnidadService
  ) {
    this.loadRutas();
    this.unidadService.unidades$.subscribe(() => {
      this.loadRutas();
    });
  }

  private loadRutas(filtros?: { status?: string; unit_id?: number }): void {
    let params = new HttpParams()
      .set('offset', '0')
      .set('limit', '100');

    if (filtros?.status) {
      params = params.set('status', filtros.status);
    }
    if (filtros?.unit_id) {
      params = params.set('unit_id', filtros.unit_id.toString());
    }

    combineLatest([
      this.http.get<RutaApiResponse[]>(this.apiUrl, { params }).pipe(
        catchError(error => {
          if (error.status === 404 && error.error?.detail?.includes('Unidad no encontrada')) {
            return of([] as RutaApiResponse[]);
          }
          if (error.status === 404) {
            return of([] as RutaApiResponse[]);
          }
          return this.handleError(error);
        })
      ),
      this.unidadService.unidades$
    ]).subscribe({
      next: ([rutasApi, unidades]) => {
        const rutasMapeadas = rutasApi.map(rutaApi => {
          const ruta = this.mapApiToRuta(rutaApi);
          if (ruta.unit_id && unidades.length > 0) {
            ruta.unidad = unidades.find(u => u.id === ruta.unit_id);
          }
          return ruta;
        });
        this.rutasSubject.next(rutasMapeadas);
      },
      error: (error) => console.error('Error cargando rutas:', error)
    });
  }

  getRutas(filtros?: { status?: string; unit_id?: number }): Observable<Ruta[]> {
    if (filtros && (filtros.status || filtros.unit_id !== undefined)) {
      this.loadRutas(filtros);
    } else {
      this.loadRutas();
    }
    return this.rutas$;
  }

  getRutaById(id: number): Observable<Ruta> {
    return combineLatest([
      this.http.get<RutaApiResponse>(`${this.apiUrl}/${id}`),
      this.unidadService.unidades$
    ]).pipe(
      map(([apiRuta, unidades]) => {
        const ruta = this.mapApiToRuta(apiRuta);
        if (ruta.unit_id && unidades.length > 0) {
          ruta.unidad = unidades.find(u => u.id === ruta.unit_id);
        }
        return ruta;
      }),
      catchError(this.handleError)
    );
  }

  crearRuta(ruta: CrearRutaRequest): Observable<Ruta> {
    return combineLatest([
      this.http.post<RutaApiResponse>(this.apiUrl, ruta),
      this.unidadService.unidades$
    ]).pipe(
      map(([apiRuta, unidades]) => {
        const nuevaRuta = this.mapApiToRuta(apiRuta);
        if (nuevaRuta.unit_id && unidades.length > 0) {
          nuevaRuta.unidad = unidades.find(u => u.id === nuevaRuta.unit_id);
        }
        return nuevaRuta;
      }),
      tap((nuevaRuta) => {
        const rutasActuales = this.rutasSubject.value;
        this.rutasSubject.next([...rutasActuales, nuevaRuta]);
      }),
      catchError(this.handleError)
    );
  }

  actualizarRuta(id: number, ruta: ActualizarRutaRequest): Observable<Ruta> {
    return combineLatest([
      this.http.patch<RutaApiResponse>(`${this.apiUrl}/${id}`, ruta),
      this.unidadService.unidades$
    ]).pipe(
      map(([apiRuta, unidades]) => {
        const rutaActualizada = this.mapApiToRuta(apiRuta);
        if (rutaActualizada.unit_id && unidades.length > 0) {
          rutaActualizada.unidad = unidades.find(u => u.id === rutaActualizada.unit_id);
        }
        return rutaActualizada;
      }),
      tap((rutaActualizada) => {
        const rutasActuales = this.rutasSubject.value;
        const index = rutasActuales.findIndex(r => r.id === id);
        if (index !== -1) {
          rutasActuales[index] = rutaActualizada;
          this.rutasSubject.next([...rutasActuales]);
        }
      }),
      catchError(this.handleError)
    );
  }

  actualizarEstadoRuta(id: number, estado: ActualizarEstadoRutaRequest): Observable<Ruta> {
    return combineLatest([
      this.http.patch<RutaApiResponse>(`${this.apiUrl}/${id}/status`, estado),
      this.unidadService.unidades$
    ]).pipe(
      map(([apiRuta, unidades]) => {
        const rutaActualizada = this.mapApiToRuta(apiRuta);
        // Asignar la unidad si existe
        if (rutaActualizada.unit_id && unidades.length > 0) {
          rutaActualizada.unidad = unidades.find(u => u.id === rutaActualizada.unit_id);
        }
        return rutaActualizada;
      }),
      tap((rutaActualizada) => {
        // Actualizar el BehaviorSubject
        const rutasActuales = this.rutasSubject.value;
        const index = rutasActuales.findIndex(r => r.id === id);
        if (index !== -1) {
          rutasActuales[index] = rutaActualizada;
          this.rutasSubject.next([...rutasActuales]);
        }
      }),
      catchError(this.handleError)
    );
  }

  eliminarRuta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const rutasActuales = this.rutasSubject.value;
        const rutasFiltradas = rutasActuales.filter(r => r.id !== id);
        this.rutasSubject.next(rutasFiltradas);
      }),
      catchError(this.handleError)
    );
  }
  private mapApiToRuta(apiRuta: RutaApiResponse): Ruta {
    return {
      id: apiRuta.id,
      origin: apiRuta.origin,
      destination: apiRuta.destination,
      distance_km: apiRuta.distance_km,
      estimated_time_hours: apiRuta.estimated_time_hours,
      unit_id: apiRuta.unit_id,
      status: apiRuta.status,
      assigned_at: new Date(apiRuta.assigned_at),
      started_at: apiRuta.started_at ? new Date(apiRuta.started_at) : null,
      completed_at: apiRuta.completed_at ? new Date(apiRuta.completed_at) : null,
      created_at: new Date(apiRuta.created_at),
      updated_at: apiRuta.updated_at ? new Date(apiRuta.updated_at) : null
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