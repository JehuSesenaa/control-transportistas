import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Ruta } from '../../models/ruta.model';
import { RutaService } from '../../services/ruta.service';

@Component({
  selector: 'app-ruta-list',
  templateUrl: './ruta-list.component.html',
  styleUrls: ['./ruta-list.component.css']
})
export class RutaListComponent implements OnInit, OnDestroy {
  rutas: Ruta[] = [];
  private destroy$ = new Subject<void>();
  mensaje: string = '';
  tipoMensaje: 'success' | 'danger' = 'success';
  dropdownOpen: { [key: number]: boolean } = {};

  filtroStatus: string = '';
  filtroUnitId: string = '';

  constructor(
    private rutaService: RutaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.rutaService.rutas$
      .pipe(takeUntil(this.destroy$))
      .subscribe(rutas => {
        this.rutas = rutas;
      });


  }



  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  crearRuta(): void {
    this.router.navigate(['/rutas/nueva']);
  }

  editarRuta(id: number): void {
    this.router.navigate(['/rutas/editar', id]);
  }

  eliminarRuta(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar esta ruta?')) {
      this.rutaService.eliminarRuta(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.mostrarMensaje('Ruta eliminada correctamente', 'success');
          },
          error: (error) => {
            console.error('Error al eliminar ruta:', error);
            this.mostrarMensaje('Error al eliminar la ruta', 'danger');
          }
        });
    }
  }

  cambiarEstado(id: number, nuevoEstado: string): void {
    this.rutaService.actualizarEstadoRuta(id, { status: nuevoEstado })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.mostrarMensaje(`Estado actualizado a ${nuevoEstado}`, 'success');
          this.closeAllDropdowns();
        },
        error: (error) => {
          console.error('Error al actualizar estado:', error);
          this.mostrarMensaje('Error al actualizar el estado', 'danger');
        }
      });
  }

  toggleDropdown(rutaId: number): void {
    // Cerrar todos los dropdowns primero
    this.closeAllDropdowns();
    // Abrir el dropdown seleccionado
    this.dropdownOpen[rutaId] = !this.dropdownOpen[rutaId];
  }

  closeAllDropdowns(): void {
    this.dropdownOpen = {};
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.closeAllDropdowns();
    }
  }

  aplicarFiltros(): void {
    const filtros: { status?: string; unit_id?: number } = {};

    console.log('Valores de filtros antes de procesar:', {
      filtroStatus: this.filtroStatus,
      filtroUnitId: this.filtroUnitId,
      tipoFiltroUnitId: typeof this.filtroUnitId
    });

    // Solo incluir filtros que no estén vacíos
    if (this.filtroStatus && this.filtroStatus !== '') {
      filtros.status = this.filtroStatus;
    }

    // Verificar filtroUnitId de diferentes maneras
    if (this.filtroUnitId !== null && this.filtroUnitId !== undefined && this.filtroUnitId !== '') {
      const unitId = typeof this.filtroUnitId === 'string' ? parseInt(this.filtroUnitId) : this.filtroUnitId;
      if (!isNaN(unitId) && unitId > 0) {
        filtros.unit_id = unitId;
      }
    }

    console.log('Aplicando filtros procesados:', filtros);
    this.rutaService.getRutas(filtros).subscribe();
  }

  limpiarFiltros(): void {
    this.filtroStatus = '';
    this.filtroUnitId = '';
    this.rutaService.getRutas().subscribe();
  }

  getEstadosDisponibles(): string[] {
    return ['ASIGNADA', 'EN_RUTA', 'COMPLETADA', 'CANCELADA'];
  }

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'danger'): void {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
    }, 3000);
  }
}
