import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Unidad } from '../../models/unidad.model';
import { UnidadService } from '../../services/unidad.service';

@Component({
  selector: 'app-unidad-list',
  templateUrl: './unidad-list.component.html',
  styleUrls: ['./unidad-list.component.css']
})
export class UnidadListComponent implements OnInit, OnDestroy {
  unidades: Unidad[] = [];
  private destroy$ = new Subject<void>();
  mensaje: string = '';
  tipoMensaje: 'success' | 'danger' = 'success';

  constructor(
    private unidadService: UnidadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.unidadService.unidades$
      .pipe(takeUntil(this.destroy$))
      .subscribe(unidades => {
        this.unidades = unidades;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  crearUnidad(): void {
    this.router.navigate(['/unidades/nuevo']);
  }

  editarUnidad(id: number): void {
    this.router.navigate(['/unidades/editar', id]);
  }

  eliminarUnidad(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar esta unidad?')) {
      this.unidadService.eliminarUnidad(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.mostrarMensaje('Unidad eliminada correctamente', 'success');
          },
          error: (error) => {
            console.error('Error al eliminar unidad:', error);
            this.mostrarMensaje('Error al eliminar la unidad', 'danger');
          }
        });
    }
  }

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'danger'): void {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
    }, 3000);
  }
}
