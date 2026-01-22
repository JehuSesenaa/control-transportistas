import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnidadService } from '../../services/unidad.service';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-unidad-form',
  templateUrl: './unidad-form.component.html',
  styleUrls: ['./unidad-form.component.css']
})
export class UnidadFormComponent implements OnInit, OnDestroy {
  unidadForm: FormGroup;
  unidadId?: number;
  esEdicion = false;
  usuarios: Usuario[] = [];
  mensaje: string = '';
  tipoMensaje: 'success' | 'danger' = 'success';
  anioMaximo: number;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private unidadService: UnidadService,
    private usuarioService: UsuarioService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.anioMaximo = new Date().getFullYear() + 1;
    this.unidadForm = this.fb.group({
      license_plate: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}-[0-9]{3}$/)]],
      brand: ['', [Validators.required, Validators.minLength(2)]],
      model: ['', [Validators.required, Validators.minLength(2)]],
      year: ['', [Validators.required, Validators.min(1900), Validators.max(this.anioMaximo)]],
      capacity: ['', [Validators.required, Validators.min(1)]],
      user_id: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.usuarioService.usuarios$
      .pipe(takeUntil(this.destroy$))
      .subscribe(usuarios => {
        this.usuarios = usuarios;
      });

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params['id'];
      if (id) {
        this.esEdicion = true;
        this.unidadId = +id;
        this.configurarFormularioEdicion();
        this.cargarUnidad(this.unidadId);
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
    // El formulario ya está configurado para creación en el constructor
  }

  private configurarFormularioEdicion(): void {
    // En edición, algunos campos pueden ser opcionales
    const controls = this.unidadForm.controls;
    Object.keys(controls).forEach(key => {
      if (key !== 'license_plate') { // La placa no se puede cambiar
        controls[key].clearValidators();
        controls[key].setValidators([Validators.minLength(key === 'brand' || key === 'model' ? 2 : 0)]);
        if (key === 'capacity') {
          controls[key].setValidators([Validators.min(1)]);
        }
        controls[key].updateValueAndValidity();
      }
    });
  }

  cargarUnidad(id: number): void {
    this.unidadService.getUnidadById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (unidad) => {
          this.unidadForm.patchValue({
            license_plate: unidad.license_plate,
            brand: unidad.brand,
            model: unidad.model,
            year: unidad.year,
            capacity: unidad.capacity,
            user_id: unidad.user_id
          });
        },
        error: (error) => {
          console.error('Error al cargar unidad:', error);
          this.mostrarMensaje('Unidad no encontrada', 'danger');
          setTimeout(() => {
            this.router.navigate(['/unidades']);
          }, 2000);
        }
      });
  }

  guardar(): void {
    if (this.unidadForm.valid) {
      const datosUnidad = this.unidadForm.value;

      if (this.esEdicion && this.unidadId) {
        // Actualizar unidad - solo enviar campos modificados
        const datosActualizacion: Partial<typeof datosUnidad> = {};

        // Solo incluir campos que tienen valor (no vacíos)
        Object.keys(datosUnidad).forEach(key => {
          if (datosUnidad[key] !== '' && datosUnidad[key] !== null && datosUnidad[key] !== undefined) {
            datosActualizacion[key] = datosUnidad[key];
          }
        });

        // Solo actualizar si hay cambios
        if (Object.keys(datosActualizacion).length > 0) {
          this.unidadService.actualizarUnidad(this.unidadId, datosActualizacion)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.mostrarMensaje('Unidad actualizada correctamente', 'success');
                setTimeout(() => {
                  this.router.navigate(['/unidades']);
                }, 1500);
              },
              error: (error) => {
                console.error('Error al actualizar unidad:', error);
                this.mostrarMensaje('Error al actualizar la unidad', 'danger');
              }
            });
        } else {
          this.mostrarMensaje('No hay cambios para guardar', 'danger');
        }
      } else {
        // Crear unidad
        this.unidadService.crearUnidad(datosUnidad)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.mostrarMensaje('Unidad creada correctamente', 'success');
              setTimeout(() => {
                this.router.navigate(['/unidades']);
              }, 1500);
            },
            error: (error) => {
              console.error('Error al crear unidad:', error);
              this.mostrarMensaje('Error al crear la unidad', 'danger');
            }
          });
      }
    } else {
      this.marcarCamposInvalidos();
    }
  }

  cancelar(): void {
    this.router.navigate(['/unidades']);
  }

  private marcarCamposInvalidos(): void {
    Object.keys(this.unidadForm.controls).forEach(key => {
      const control = this.unidadForm.get(key);
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

  get license_plate() {
    return this.unidadForm.get('license_plate');
  }

  get brand() {
    return this.unidadForm.get('brand');
  }

  get model() {
    return this.unidadForm.get('model');
  }

  get year() {
    return this.unidadForm.get('year');
  }

  get capacity() {
    return this.unidadForm.get('capacity');
  }

  get user_id() {
    return this.unidadForm.get('user_id');
  }
}
