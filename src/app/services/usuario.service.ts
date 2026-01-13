import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private usuarios: Usuario[] = [];
  private usuariosSubject = new BehaviorSubject<Usuario[]>([]);
  public usuarios$ = this.usuariosSubject.asObservable();
  private nextId = 1;

  constructor() {
    // Inicializar con algunos datos de ejemplo
    this.loadInitialData();
  }

  private loadInitialData(): void {
    const initialData: Usuario[] = [
      {
        id: this.nextId++,
        nombre: 'Juan Pérez',
        email: 'juan.perez@example.com',
        telefono: '1234567890',
        fechaCreacion: new Date()
      },
      {
        id: this.nextId++,
        nombre: 'María García',
        email: 'maria.garcia@example.com',
        telefono: '0987654321',
        fechaCreacion: new Date()
      }
    ];
    this.usuarios = initialData;
    this.usuariosSubject.next([...this.usuarios]);
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.usuarios$;
  }

  getUsuarioById(id: number): Usuario | undefined {
    return this.usuarios.find(u => u.id === id);
  }

  crearUsuario(usuario: Omit<Usuario, 'id' | 'fechaCreacion'>): Usuario {
    const nuevoUsuario: Usuario = {
      ...usuario,
      id: this.nextId++,
      fechaCreacion: new Date()
    };
    this.usuarios.push(nuevoUsuario);
    this.usuariosSubject.next([...this.usuarios]);
    return nuevoUsuario;
  }

  actualizarUsuario(id: number, usuario: Partial<Usuario>): Usuario | null {
    const index = this.usuarios.findIndex(u => u.id === id);
    if (index === -1) {
      return null;
    }
    this.usuarios[index] = { ...this.usuarios[index], ...usuario };
    this.usuariosSubject.next([...this.usuarios]);
    return this.usuarios[index];
  }

  eliminarUsuario(id: number): boolean {
    const index = this.usuarios.findIndex(u => u.id === id);
    if (index === -1) {
      return false;
    }
    this.usuarios.splice(index, 1);
    this.usuariosSubject.next([...this.usuarios]);
    return true;
  }
}
