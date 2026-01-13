import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-usuario-list',
  templateUrl: './usuario-list.component.html',
  styleUrls: ['./usuario-list.component.css']
})
export class UsuarioListComponent implements OnInit, OnDestroy {
  usuarios: Usuario[] = [];
  private subscription?: Subscription;
  mensaje: string = '';
  tipoMensaje: 'success' | 'danger' = 'success';

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription = this.usuarioService.getUsuarios().subscribe(
      usuarios => {
        this.usuarios = usuarios;
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  crearUsuario(): void {
    this.router.navigate(['/usuarios/nuevo']);
  }

  editarUsuario(id: number): void {
    this.router.navigate(['/usuarios/editar', id]);
  }

  eliminarUsuario(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
      const usuario = this.usuarioService.getUsuarioById(id);
      if (usuario) {
        const eliminado = this.usuarioService.eliminarUsuario(id);
        if (eliminado) {
          this.mostrarMensaje(`Usuario "${usuario.nombre}" eliminado correctamente`, 'success');
        } else {
          this.mostrarMensaje('Error al eliminar el usuario', 'danger');
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
