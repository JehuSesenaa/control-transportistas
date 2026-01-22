import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';

const routes: Routes = [
  { path: '', redirectTo: '/usuarios', pathMatch: 'full' },
  { path: 'usuarios', loadChildren: () => import('./usuarios/usuarios.module').then(m => m.UsuariosModule) },
  { path: 'unidades', loadChildren: () => import('./unidades/unidades.module').then(m => m.UnidadesModule) },
  { path: 'rutas', loadChildren: () => import('./rutas/rutas.module').then(m => m.RutasModule) },
  { path: 'performances', loadChildren: () => import('./performances/performances.module').then(m => m.PerformancesModule) },
  { path: '**', redirectTo: '/usuarios' }
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
