import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, retry, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario.model';

interface UsuarioApiResponse {
  id: number;
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
  phone: string;
  created_at: string;
  updated_at: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/users`;
  private usuariosSubject = new BehaviorSubject<Usuario[]>([]);
  public usuarios$ = this.usuariosSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.http.get<UsuarioApiResponse[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    ).subscribe({
      next: (usuarios) => {
        const usuariosMapeados = usuarios.map(u => this.mapApiToUsuario(u));
        this.usuariosSubject.next(usuariosMapeados);
      },
      error: (error) => console.error('Error cargando usuarios:', error)
    });
  }

getUsuarios(): Observable<Usuario[]> {
  return this.usuarios$;
}
  getUsuarioById(id: number): Observable<Usuario> {
    return this.http.get<UsuarioApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map(apiUser => this.mapApiToUsuario(apiUser)),
      catchError(this.handleError)
    );
  }

crearUsuario(usuario: Omit<Usuario, 'id' | 'fechaCreacion'> & { password: string }): Observable<Usuario> {
  const usuarioApi = {
    username: usuario.nombre,
    full_name: usuario.nombre,
    email: usuario.email
  };

    return this.http.post<UsuarioApiResponse>(this.apiUrl, usuarioApi).pipe(
      map(apiUser => this.mapApiToUsuario(apiUser)),
      tap((nuevoUsuario) => {
        const usuariosActuales = this.usuariosSubject.value;
        this.usuariosSubject.next([...usuariosActuales, nuevoUsuario]);
      }),
      catchError(this.handleError)
    );
  }

  // Actualizar usuario en la API
  actualizarUsuario(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    const usuarioApi: Partial<UsuarioApiResponse> = {};
    if (usuario.nombre) {
      usuarioApi.username = usuario.nombre;
      usuarioApi.full_name = usuario.nombre;
    }
    if (usuario.email) {
      usuarioApi.email = usuario.email;
    }
    if (usuario.telefono) {
      usuarioApi.phone = usuario.telefono;
    }
    return this.http.patch<UsuarioApiResponse>(`${this.apiUrl}/${id}`, usuarioApi).pipe(
      map(apiUser => this.mapApiToUsuario(apiUser)),
      tap((usuarioActualizado) => {
        const usuariosActuales = this.usuariosSubject.value;
        const index = usuariosActuales.findIndex(u => u.id === id);
        if (index !== -1) {
          usuariosActuales[index] = usuarioActualizado;
          this.usuariosSubject.next([...usuariosActuales]);
        }
      }),
      catchError(this.handleError)
    );
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const usuariosActuales = this.usuariosSubject.value;
        const usuariosFiltrados = usuariosActuales.filter(u => u.id !== id);
        this.usuariosSubject.next(usuariosFiltrados);
      }),
      catchError(this.handleError)
    );
  }

  refrescarUsuarios(): void {
    this.loadUsers();
  }

  // Mapear respuesta de API a modelo Usuario
  private mapApiToUsuario(apiUser: UsuarioApiResponse): Usuario {
    return {
      id: apiUser.id,
      nombre: apiUser.full_name || apiUser.username,
      email: apiUser.email,
      telefono: apiUser.phone,
      fechaCreacion: new Date(apiUser.created_at)
    };
  }

  // Manejo de errores
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
