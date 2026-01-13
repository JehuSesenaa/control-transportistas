import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-usuario-form',
  templateUrl: './usuario-form.component.html',
  styleUrls: ['./usuario-form.component.css']
})
export class UsuarioFormComponent implements OnInit {
  usuarioForm: FormGroup;
  usuarioId?: number;
  esEdicion = false;
  mensaje: string = '';
  tipoMensaje: 'success' | 'danger' = 'success';

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.esEdicion = true;
        this.usuarioId = +id;
        this.cargarUsuario(this.usuarioId);
      }
    });
  }

  cargarUsuario(id: number): void {
    const usuario = this.usuarioService.getUsuarioById(id);
    if (usuario) {
      this.usuarioForm.patchValue({
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono
      });
    } else {
      this.mostrarMensaje('Usuario no encontrado', 'danger');
      setTimeout(() => {
        this.router.navigate(['/usuarios']);
      }, 2000);
    }
  }

  guardar(): void {
    if (this.usuarioForm.valid) {
      const datosUsuario = this.usuarioForm.value;
      
      if (this.esEdicion && this.usuarioId) {
        const actualizado = this.usuarioService.actualizarUsuario(this.usuarioId, datosUsuario);
        if (actualizado) {
          this.mostrarMensaje('Usuario actualizado correctamente', 'success');
          setTimeout(() => {
            this.router.navigate(['/usuarios']);
          }, 1500);
        } else {
          this.mostrarMensaje('Error al actualizar el usuario', 'danger');
        }
      } else {
        const creado = this.usuarioService.crearUsuario(datosUsuario);
        if (creado) {
          this.mostrarMensaje('Usuario creado correctamente', 'success');
          setTimeout(() => {
            this.router.navigate(['/usuarios']);
          }, 1500);
        } else {
          this.mostrarMensaje('Error al crear el usuario', 'danger');
        }
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
}
