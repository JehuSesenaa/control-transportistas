import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Unidad } from '../models/unidad.model';
import { Usuario } from '../models/usuario.model';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root'
})
export class UnidadService {
  private unidades: Unidad[] = [];
  private unidadesSubject = new BehaviorSubject<Unidad[]>([]);
  public unidades$ = this.unidadesSubject.asObservable();
  private nextId = 1;

  constructor(private usuarioService: UsuarioService) {
    // Inicializar con algunos datos de ejemplo
    this.loadInitialData();
  }

  private loadInitialData(): void {
    const initialData: Unidad[] = [
      {
        id: this.nextId++,
        placa: 'ABC-123',
        marca: 'Toyota',
        modelo: 'Corolla',
        anio: 2020,
        usuarioId: 1,
        fechaCreacion: new Date()
      },
      {
        id: this.nextId++,
        placa: 'XYZ-789',
        marca: 'Honda',
        modelo: 'Civic',
        anio: 2021,
        usuarioId: 2,
        fechaCreacion: new Date()
      }
    ];
    this.unidades = initialData;
    this.unidadesSubject.next([...this.unidades]);
  }

  getUnidades(): Observable<Unidad[]> {
    return combineLatest([
      this.unidades$,
      this.usuarioService.usuarios$
    ]).pipe(
      map(([unidades, usuarios]) => {
        return unidades.map(unidad => ({
          ...unidad,
          usuario: usuarios.find(u => u.id === unidad.usuarioId)
        }));
      })
    );
  }

  getUnidadById(id: number): Unidad | undefined {
    return this.unidades.find(u => u.id === id);
  }

  crearUnidad(unidad: Omit<Unidad, 'id' | 'fechaCreacion' | 'usuario'>): Unidad {
    const nuevaUnidad: Unidad = {
      ...unidad,
      id: this.nextId++,
      fechaCreacion: new Date()
    };
    this.unidades.push(nuevaUnidad);
    this.unidadesSubject.next([...this.unidades]);
    return nuevaUnidad;
  }

  actualizarUnidad(id: number, unidad: Partial<Unidad>): Unidad | null {
    const index = this.unidades.findIndex(u => u.id === id);
    if (index === -1) {
      return null;
    }
    this.unidades[index] = { ...this.unidades[index], ...unidad };
    this.unidadesSubject.next([...this.unidades]);
    return this.unidades[index];
  }

  eliminarUnidad(id: number): boolean {
    const index = this.unidades.findIndex(u => u.id === id);
    if (index === -1) {
      return false;
    }
    this.unidades.splice(index, 1);
    this.unidadesSubject.next([...this.unidades]);
    return true;
  }
}
