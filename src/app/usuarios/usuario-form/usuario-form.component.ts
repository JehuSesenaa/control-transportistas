import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-usuario-form',
  templateUrl: './usuario-form.component.html',
  styleUrls: ['./usuario-form.component.css']
})
export class UsuarioFormComponent implements OnInit, OnDestroy {
  usuarioForm: FormGroup;
  usuarioId?: number;
  esEdicion = false;
  mensaje: string = '';
  tipoMensaje: 'success' | 'danger' = 'success';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // El formulario se inicializa vacío y se configura en ngOnInit
    this.usuarioForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params['id'];
      if (id) {
        this.esEdicion = true;
        this.usuarioId = +id;
        this.configurarFormularioEdicion();
        this.cargarUsuario(this.usuarioId);
      } else {
        this.esEdicion = false;
        this.configurarFormularioCreacion();
      }
    });
  }

  private configurarFormularioCreacion(): void {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  private configurarFormularioEdicion(): void {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.minLength(3)]],
      email: ['', [Validators.email]],
      telefono: ['', [Validators.pattern(/^[0-9]{10}$/)]]
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarUsuario(id: number): void {
    this.usuarioService.getUsuarioById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (usuario) => {
          this.usuarioForm.patchValue({
            nombre: usuario.nombre,
            email: usuario.email,
            telefono: usuario.telefono
          });
        },
        error: (error) => {
          console.error('Error al cargar usuario:', error);
          this.mostrarMensaje('Usuario no encontrado', 'danger');
          setTimeout(() => {
            this.router.navigate(['/usuarios']);
          }, 2000);
        }
      });
  }

  guardar(): void {
    if (this.usuarioForm.valid) {
      const datosUsuario = this.usuarioForm.value;

      if (this.esEdicion && this.usuarioId) {
        // Actualizar usuario - solo enviar campos modificados
        const datosActualizacion: Partial<typeof datosUsuario> = {};

        // Solo incluir campos que tienen valor (no vacíos)
        Object.keys(datosUsuario).forEach(key => {
          if (datosUsuario[key] !== '' && datosUsuario[key] !== null && datosUsuario[key] !== undefined) {
            datosActualizacion[key] = datosUsuario[key];
          }
        });

        // Solo actualizar si hay cambios
        if (Object.keys(datosActualizacion).length > 0) {
          this.usuarioService.actualizarUsuario(this.usuarioId, datosActualizacion)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.mostrarMensaje('Usuario actualizado correctamente', 'success');
                setTimeout(() => {
                  this.router.navigate(['/usuarios']);
                }, 1500);
              },
              error: (error) => {
                console.error('Error al actualizar usuario:', error);
                this.mostrarMensaje('Error al actualizar el usuario', 'danger');
              }
            });
        } else {
          this.mostrarMensaje('No hay cambios para guardar', 'danger');
        }
      } else {
        // Crear usuario
        this.usuarioService.crearUsuario(datosUsuario)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.mostrarMensaje('Usuario creado correctamente', 'success');
              setTimeout(() => {
                this.router.navigate(['/usuarios']);
              }, 1500);
            },
            error: (error) => {
              console.error('Error al crear usuario:', error);
              this.mostrarMensaje('Error al crear el usuario', 'danger');
            }
          });
      }
    } else {
      this.marcarCamposInvalidos();
    }
  }

  cancelar(): void {
    this.router.navigate(['/usuarios']);
  }

  private marcarCamposInvalidos(): void {
    Object.keys(this.usuarioForm.controls).forEach(key => {
      const control = this.usuarioForm.get(key);
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

  get nombre() {
    return this.usuarioForm.get('nombre');
  }

  get email() {
    return this.usuarioForm.get('email');
  }

  get telefono() {
    return this.usuarioForm.get('telefono');
  }

  get password() {
    return this.usuarioForm.get('password');
  }
}
