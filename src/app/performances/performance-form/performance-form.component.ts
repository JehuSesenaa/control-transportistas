import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PerformanceService } from '../../services/performance.service';
import { RutaService } from '../../services/ruta.service';
import { Ruta } from '../../models/ruta.model';

@Component({
  selector: 'app-performance-form',
  templateUrl: './performance-form.component.html',
  styleUrls: ['./performance-form.component.css']
})
export class PerformanceFormComponent implements OnInit, OnDestroy {
  performanceForm: FormGroup;
  performanceId?: number;
  esEdicion = false;
  rutas: Ruta[] = [];
  mensaje: string = '';
  tipoMensaje: 'success' | 'danger' = 'success';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private performanceService: PerformanceService,
    private rutaService: RutaService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.performanceForm = this.fb.group({
      route_id: ['', Validators.required],
      distance_traveled_km: ['', [Validators.required, Validators.min(0.1)]],
      fuel_consumed_liters: ['', [Validators.required, Validators.min(0.1)]],
      actual_time_hours: ['', [Validators.required, Validators.min(0.1)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.rutaService.rutas$
      .pipe(takeUntil(this.destroy$))
      .subscribe(rutas => {
        this.rutas = rutas.filter(ruta => ruta.status === 'COMPLETADA');
      });

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params['id'];
      if (id) {
        this.esEdicion = true;
        this.performanceId = +id;
        this.cargarPerformance(this.performanceId);
      } else {
        this.esEdicion = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarPerformance(id: number): void {
    this.performanceService.getPerformanceById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (performance) => {
          this.performanceForm.patchValue({
            route_id: performance.route_id,
            distance_traveled_km: performance.distance_traveled_km,
            fuel_consumed_liters: performance.fuel_consumed_liters,
            actual_time_hours: performance.actual_time_hours,
            notes: performance.notes
          });
        },
        error: (error) => {
          console.error('Error al cargar performance:', error);
          this.mostrarMensaje('Registro de rendimiento no encontrado', 'danger');
          setTimeout(() => {
            this.router.navigate(['/performances']);
          }, 2000);
        }
      });
  }

  guardar(): void {
    if (this.performanceForm.valid) {
      const datosPerformance = this.performanceForm.value;

      if (this.esEdicion && this.performanceId) {
        const datosActualizacion: any = {};

        if (datosPerformance.distance_traveled_km !== undefined && datosPerformance.distance_traveled_km > 0) {
          datosActualizacion.distance_traveled_km = datosPerformance.distance_traveled_km;
        }
        if (datosPerformance.fuel_consumed_liters !== undefined && datosPerformance.fuel_consumed_liters > 0) {
          datosActualizacion.fuel_consumed_liters = datosPerformance.fuel_consumed_liters;
        }
        if (datosPerformance.actual_time_hours !== undefined && datosPerformance.actual_time_hours > 0) {
          datosActualizacion.actual_time_hours = datosPerformance.actual_time_hours;
        }
        if (datosPerformance.notes && datosPerformance.notes.trim()) {
          datosActualizacion.notes = datosPerformance.notes;
        }

        if (Object.keys(datosActualizacion).length > 0) {
          this.performanceService.actualizarPerformance(this.performanceId, datosActualizacion)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.mostrarMensaje('Registro de rendimiento actualizado correctamente', 'success');
                setTimeout(() => {
                  this.router.navigate(['/performances']);
                }, 1500);
              },
              error: (error) => {
                console.error('Error al actualizar performance:', error);
                const errorMessage = error?.error?.detail || 'Error al actualizar el registro de rendimiento';
                this.mostrarMensaje(errorMessage, 'danger');
              }
            });
        } else {
          this.mostrarMensaje('No hay cambios para guardar', 'danger');
        }
          } else {
            this.performanceService.crearPerformance(datosPerformance)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.mostrarMensaje('Registro de rendimiento creado correctamente', 'success');
              setTimeout(() => {
                this.router.navigate(['/performances']);
              }, 1500);
            },
            error: (error) => {
              console.error('Error al crear performance:', error);
              const errorMessage = error?.error?.detail || 'Error al crear el registro de rendimiento';
              this.mostrarMensaje(errorMessage, 'danger');
            }
          });
      }
    } else {
      this.marcarCamposInvalidos();
    }
  }

  cancelar(): void {
    this.router.navigate(['/performances']);
  }

  private marcarCamposInvalidos(): void {
    Object.keys(this.performanceForm.controls).forEach(key => {
      const control = this.performanceForm.get(key);
      if (control && control.invalid) {
        control.markAsTouched();
      }
    });
  }

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'danger'): void {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
    }, 3000);
  }

  get route_id() {
    return this.performanceForm.get('route_id');
  }

  get distance_traveled_km() {
    return this.performanceForm.get('distance_traveled_km');
  }

  get fuel_consumed_liters() {
    return this.performanceForm.get('fuel_consumed_liters');
  }

  get actual_time_hours() {
    return this.performanceForm.get('actual_time_hours');
  }
}
