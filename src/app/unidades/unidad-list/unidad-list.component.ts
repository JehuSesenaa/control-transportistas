import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Unidad } from '../../models/unidad.model';
import { UnidadService } from '../../services/unidad.service';

@Component({
  selector: 'app-unidad-list',
  templateUrl: './unidad-list.component.html',
  styleUrls: ['./unidad-list.component.css']
})
export class UnidadListComponent implements OnInit, OnDestroy {
  unidades: Unidad[] = [];
  private subscription?: Subscription;
  mensaje: string = '';
  tipoMensaje: 'success' | 'danger' = 'success';

  constructor(
    private unidadService: UnidadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription = this.unidadService.getUnidades().subscribe(
      unidades => {
        this.unidades = unidades;
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  crearUnidad(): void {
    this.router.navigate(['/unidades/nuevo']);
  }

  editarUnidad(id: number): void {
    this.router.navigate(['/unidades/editar', id]);
  }

  eliminarUnidad(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar esta unidad?')) {
      const unidad = this.unidadService.getUnidadById(id);
      if (unidad) {
        const eliminado = this.unidadService.eliminarUnidad(id);
        if (eliminado) {
          this.mostrarMensaje(`Unidad "${unidad.placa}" eliminada correctamente`, 'success');
        } else {
          this.mostrarMensaje('Error al eliminar la unidad', 'danger');
        }
      }
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
