import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { UnidadListComponent } from './unidad-list/unidad-list.component';
import { UnidadFormComponent } from './unidad-form/unidad-form.component';

const routes: Routes = [
  { path: '', component: UnidadListComponent },
  { path: 'nuevo', component: UnidadFormComponent },
  { path: 'editar/:id', component: UnidadFormComponent }
];

@NgModule({
  declarations: [
    UnidadListComponent,
    UnidadFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class UnidadesModule { }
