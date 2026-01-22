import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, combineLatest } from 'rxjs';
import { Unidad } from '../models/unidad.model';
import { UsuarioService } from './usuario.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, map, tap, skip } from 'rxjs/operators';

interface UnidadApiResponse {
  id: number;
  license_plate: string;
  brand: string;
  model: string;
  year: number;
  capacity: number;
  user_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CrearUnidadRequest {
  license_plate: string;
  brand: string;
  model: string;
  year: number;
  capacity: number;
  user_id: number;
}

interface ActualizarUnidadRequest {
  license_plate?: string;
  brand?: string;
  model?: string;
  year?: number;
  capacity?: number;
  is_active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UnidadService {
  private apiUrl = `${environment.apiUrl}/units`;
  private unidadesSubject = new BehaviorSubject<Unidad[]>([]);
  public unidades$ = this.unidadesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private usuarioService: UsuarioService
  ) {
    this.loadUnits();
    this.usuarioService.usuarios$.pipe(skip(1)).subscribe(() => {
      this.loadUnits();
    });
  }

  private loadUnits(): void {
    // Combinar unidades con usuarios para poblar la información del usuario asignado
    combineLatest([
      this.http.get<UnidadApiResponse[]>(this.apiUrl).pipe(catchError(this.handleError)),
      this.usuarioService.usuarios$
    ]).subscribe({
      next: ([unidadesApi, usuarios]) => {
        const unidadesMapeadas = unidadesApi.map(unidadApi => {
          const unidad = this.mapApiToUnidad(unidadApi);
          if (unidad.user_id && usuarios.length > 0) {
            unidad.usuario = usuarios.find(u => u.id === unidad.user_id);
          }
          return unidad;
        });
        this.unidadesSubject.next(unidadesMapeadas);
      },
      error: (error) => console.error('Error cargando unidades:', error)
    });
  }

  getUnidades(): Observable<Unidad[]> {
    return this.unidades$;
  }

  getUnidadById(id: number): Observable<Unidad> {
    return combineLatest([
      this.http.get<UnidadApiResponse>(`${this.apiUrl}/${id}`),
      this.usuarioService.usuarios$
    ]).pipe(
      map(([apiUnidad, usuarios]) => {
        const unidad = this.mapApiToUnidad(apiUnidad);
        if (unidad.user_id && usuarios.length > 0) {
          unidad.usuario = usuarios.find(u => u.id === unidad.user_id);
        }
        return unidad;
      }),
      catchError(this.handleError)
    );
  }

  crearUnidad(unidad: Omit<Unidad, 'id' | 'is_active' | 'created_at' | 'updated_at' | 'usuario'>): Observable<Unidad> {
    const unidadApi: CrearUnidadRequest = {
      license_plate: unidad.license_plate,
      brand: unidad.brand,
      model: unidad.model,
      year: unidad.year,
      capacity: unidad.capacity,
      user_id: unidad.user_id
    };

    return combineLatest([
      this.http.post<UnidadApiResponse>(this.apiUrl, unidadApi),
      this.usuarioService.usuarios$
    ]).pipe(
      map(([apiUnidad, usuarios]) => {
        const nuevaUnidad = this.mapApiToUnidad(apiUnidad);
        if (nuevaUnidad.user_id && usuarios.length > 0) {
          nuevaUnidad.usuario = usuarios.find(u => u.id === nuevaUnidad.user_id);
        }
        return nuevaUnidad;
      }),
      tap((nuevaUnidad) => {
        const unidadesActuales = this.unidadesSubject.value;
        this.unidadesSubject.next([...unidadesActuales, nuevaUnidad]);
      }),
      catchError(this.handleError)
    );
  }

  actualizarUnidad(id: number, unidad: Partial<Omit<Unidad, 'id' | 'created_at' | 'updated_at' | 'usuario'>>): Observable<Unidad> {
    const unidadApi: ActualizarUnidadRequest = {};

    if (unidad.license_plate !== undefined) unidadApi.license_plate = unidad.license_plate;
    if (unidad.brand !== undefined) unidadApi.brand = unidad.brand;
    if (unidad.model !== undefined) unidadApi.model = unidad.model;
    if (unidad.year !== undefined) unidadApi.year = unidad.year;
    if (unidad.capacity !== undefined) unidadApi.capacity = unidad.capacity;
    if (unidad.is_active !== undefined) unidadApi.is_active = unidad.is_active;

    return combineLatest([
      this.http.patch<UnidadApiResponse>(`${this.apiUrl}/${id}`, unidadApi),
      this.usuarioService.usuarios$
    ]).pipe(
      map(([apiUnidad, usuarios]) => {
        const unidadActualizada = this.mapApiToUnidad(apiUnidad);
        if (unidadActualizada.user_id && usuarios.length > 0) {
          unidadActualizada.usuario = usuarios.find(u => u.id === unidadActualizada.user_id);
        }
        return unidadActualizada;
      }),
      tap((unidadActualizada) => {
        const unidadesActuales = this.unidadesSubject.value;
        const index = unidadesActuales.findIndex(u => u.id === id);
        if (index !== -1) {
          unidadesActuales[index] = unidadActualizada;
          this.unidadesSubject.next([...unidadesActuales]);
        }
      }),
      catchError(this.handleError)
    );
  }

  eliminarUnidad(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const unidadesActuales = this.unidadesSubject.value;
        const unidadesFiltradas = unidadesActuales.filter(u => u.id !== id);
        this.unidadesSubject.next(unidadesFiltradas);
      }),
      catchError(this.handleError)
    );
  }
  private mapApiToUnidad(apiUnidad: UnidadApiResponse): Unidad {
    return {
      id: apiUnidad.id,
      license_plate: apiUnidad.license_plate,
      brand: apiUnidad.brand,
      model: apiUnidad.model,
      year: apiUnidad.year,
      capacity: apiUnidad.capacity,
      user_id: apiUnidad.user_id,
      is_active: apiUnidad.is_active,
      created_at: new Date(apiUnidad.created_at),
      updated_at: new Date(apiUnidad.updated_at)
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
