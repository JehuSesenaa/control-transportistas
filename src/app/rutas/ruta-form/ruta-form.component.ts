import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RutaService } from '../../services/ruta.service';
import { UnidadService } from '../../services/unidad.service';
import { Unidad } from '../../models/unidad.model';

interface RutaFormData {
  origin: string;
  destination: string;
  distance_km: number;
  estimated_time_hours: number;
  unit_id: number;
}

@Component({
  selector: 'app-ruta-form',
  templateUrl: './ruta-form.component.html',
  styleUrls: ['./ruta-form.component.css']
})
export class RutaFormComponent implements OnInit, OnDestroy {
  rutaForm: FormGroup;
  rutaId?: number;
  esEdicion = false;
  unidades: Unidad[] = [];
  mensaje: string = '';
  tipoMensaje: 'success' | 'danger' = 'success';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private rutaService: RutaService,
    private unidadService: UnidadService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.rutaForm = this.fb.group({
      origin: ['', [Validators.required, Validators.minLength(2)]],
      destination: ['', [Validators.required, Validators.minLength(2)]],
      distance_km: ['', [Validators.required, Validators.min(0.1)]],
      estimated_time_hours: ['', [Validators.required, Validators.min(0.1)]],
      unit_id: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.unidadService.unidades$
      .pipe(takeUntil(this.destroy$))
      .subscribe(unidades => {
        this.unidades = unidades;
      });

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params['id'];
      if (id) {
        this.esEdicion = true;
        this.rutaId = +id;
        this.configurarFormularioEdicion();
        this.cargarRuta(this.rutaId);
      } else {
        this.esEdicion = false;
        this.configurarFormularioCreacion();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private configurarFormularioCreacion(): void {
  }

  private configurarFormularioEdicion(): void {
    const controls = this.rutaForm.controls;
    (controls as any).origin.clearValidators();
    (controls as any).origin.setValidators([Validators.minLength(2)]);

    (controls as any).destination.clearValidators();
    (controls as any).destination.setValidators([Validators.minLength(2)]);

    (controls as any).distance_km.clearValidators();
    (controls as any).distance_km.setValidators([Validators.min(0.1)]);

    (controls as any).estimated_time_hours.clearValidators();
    (controls as any).estimated_time_hours.setValidators([Validators.min(0.1)]);

    Object.keys(controls).forEach(key => {
      controls[key].updateValueAndValidity();
    });
  }

  cargarRuta(id: number): void {
    this.rutaService.getRutaById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ruta) => {
          if (ruta.status === 'COMPLETADA') {
            this.mostrarMensaje('No se puede editar una ruta completada', 'danger');
            this.rutaForm.disable();
            this.rutaForm.patchValue({
              origin: ruta.origin as string,
              destination: ruta.destination as string,
              distance_km: ruta.distance_km as number,
              estimated_time_hours: ruta.estimated_time_hours as number,
              unit_id: ruta.unit_id as number
            });
            return;
          }

          this.rutaForm.patchValue({
            origin: ruta.origin as string,
            destination: ruta.destination as string,
            distance_km: ruta.distance_km as number,
            estimated_time_hours: ruta.estimated_time_hours as number,
            unit_id: ruta.unit_id as number
          });
        },
        error: (error) => {
          console.error('Error al cargar ruta:', error);
          this.mostrarMensaje('Ruta no encontrada', 'danger');
          setTimeout(() => {
            this.router.navigate(['/rutas']);
          }, 2000);
        }
      });
  }

  guardar(): void {
    if (this.rutaForm.valid) {
      const datosRuta = this.rutaForm.value as RutaFormData;

      if (this.esEdicion && this.rutaId) {
        const datosActualizacion: any = {};

        if (datosRuta.origin && datosRuta.origin.trim()) datosActualizacion.origin = datosRuta.origin;
        if (datosRuta.destination && datosRuta.destination.trim()) datosActualizacion.destination = datosRuta.destination;
        if (datosRuta.distance_km !== undefined && datosRuta.distance_km > 0) datosActualizacion.distance_km = datosRuta.distance_km;
        if (datosRuta.estimated_time_hours !== undefined && datosRuta.estimated_time_hours > 0) datosActualizacion.estimated_time_hours = datosRuta.estimated_time_hours;
        if (datosRuta.unit_id) datosActualizacion.unit_id = datosRuta.unit_id;

        if (Object.keys(datosActualizacion).length > 0) {
          this.rutaService.actualizarRuta(this.rutaId, datosActualizacion)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.mostrarMensaje('Ruta actualizada correctamente', 'success');
                setTimeout(() => {
                  this.router.navigate(['/rutas']);
                }, 1500);
              },
              error: (error) => {
                console.error('Error al actualizar ruta:', error);
                // Mostrar el mensaje específico del backend si existe
                const errorMessage = error?.error?.detail || 'Error al actualizar la ruta';
                this.mostrarMensaje(errorMessage, 'danger');
              }
            });
        } else {
          this.mostrarMensaje('No hay cambios para guardar', 'danger');
        }
          } else {
            this.rutaService.crearRuta(datosRuta)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.mostrarMensaje('Ruta creada correctamente', 'success');
              setTimeout(() => {
                  this.router.navigate(['/rutas']);
                }, 1500);
            },
            error: (error) => {
              console.error('Error al crear ruta:', error);
              this.mostrarMensaje('Error al crear la ruta', 'danger');
            }
          });
      }
    } else {
      this.marcarCamposInvalidos();
    }
  }

  cancelar(): void {
    this.router.navigate(['/rutas']);
  }

  private marcarCamposInvalidos(): void {
    Object.keys(this.rutaForm.controls).forEach(key => {
      const control = this.rutaForm.get(key);
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

  get origin() {
    return this.rutaForm.get('origin');
  }

  get destination() {
    return this.rutaForm.get('destination');
  }

  get distance_km() {
    return this.rutaForm.get('distance_km');
  }

  get estimated_time_hours() {
    return this.rutaForm.get('estimated_time_hours');
  }

  get unit_id() {
    return this.rutaForm.get('unit_id');
  }
}
