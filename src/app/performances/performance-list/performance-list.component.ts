import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Performance } from '../../models/performance.model';
import { PerformanceService } from '../../services/performance.service';

@Component({
  selector: 'app-performance-list',
  templateUrl: './performance-list.component.html',
  styleUrls: ['./performance-list.component.css']
})
export class PerformanceListComponent implements OnInit, OnDestroy {
  performances: Performance[] = [];
  private destroy$ = new Subject<void>();
  mensaje: string = '';
  tipoMensaje: 'success' | 'danger' = 'success';

  constructor(
    private performanceService: PerformanceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.performanceService.performances$
      .pipe(takeUntil(this.destroy$))
      .subscribe(performances => {
        this.performances = performances;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  crearPerformance(): void {
    this.router.navigate(['/performances/nueva']);
  }

  editarPerformance(id: number): void {
    this.router.navigate(['/performances/editar', id]);
  }

  eliminarPerformance(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este registro de rendimiento?')) {
      this.performanceService.eliminarPerformance(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.mostrarMensaje('Registro de rendimiento eliminado correctamente', 'success');
          },
          error: (error) => {
            console.error('Error al eliminar performance:', error);
            this.mostrarMensaje('Error al eliminar el registro de rendimiento', 'danger');
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
