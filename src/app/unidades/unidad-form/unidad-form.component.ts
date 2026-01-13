import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
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
  private subscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private unidadService: UnidadService,
    private usuarioService: UsuarioService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.anioMaximo = new Date().getFullYear() + 1;
    this.unidadForm = this.fb.group({
      placa: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}-[0-9]{3}$/)]],
      marca: ['', [Validators.required, Validators.minLength(2)]],
      modelo: ['', [Validators.required, Validators.minLength(2)]],
      anio: ['', [Validators.required, Validators.min(1900), Validators.max(this.anioMaximo)]],
      usuarioId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Cargar usuarios disponibles
    this.subscription = this.usuarioService.getUsuarios().subscribe(
      usuarios => {
        this.usuarios = usuarios;
      }
    );

    // Cargar unidad si es edición
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.esEdicion = true;
        this.unidadId = +id;
        this.cargarUnidad(this.unidadId);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  cargarUnidad(id: number): void {
    const unidad = this.unidadService.getUnidadById(id);
    if (unidad) {
      this.unidadForm.patchValue({
        placa: unidad.placa,
        marca: unidad.marca,
        modelo: unidad.modelo,
        anio: unidad.anio,
        usuarioId: unidad.usuarioId
      });
    } else {
      this.mostrarMensaje('Unidad no encontrada', 'danger');
      setTimeout(() => {
        this.router.navigate(['/unidades']);
      }, 2000);
    }
  }

  guardar(): void {
    if (this.unidadForm.valid) {
      const datosUnidad = this.unidadForm.value;
      
      if (this.esEdicion && this.unidadId) {
        const actualizado = this.unidadService.actualizarUnidad(this.unidadId, datosUnidad);
        if (actualizado) {
          this.mostrarMensaje('Unidad actualizada correctamente', 'success');
          setTimeout(() => {
            this.router.navigate(['/unidades']);
          }, 1500);
        } else {
          this.mostrarMensaje('Error al actualizar la unidad', 'danger');
        }
      } else {
        const creado = this.unidadService.crearUnidad(datosUnidad);
        if (creado) {
          this.mostrarMensaje('Unidad creada correctamente', 'success');
          setTimeout(() => {
            this.router.navigate(['/unidades']);
          }, 1500);
        } else {
          this.mostrarMensaje('Error al crear la unidad', 'danger');
        }
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

  get placa() {
    return this.unidadForm.get('placa');
  }

  get marca() {
    return this.unidadForm.get('marca');
  }

  get modelo() {
    return this.unidadForm.get('modelo');
  }

  get anio() {
    return this.unidadForm.get('anio');
  }

  get usuarioId() {
    return this.unidadForm.get('usuarioId');
  }
}
