import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RutaListComponent } from './ruta-list/ruta-list.component';
import { RutaFormComponent } from './ruta-form/ruta-form.component';

const routes: Routes = [
  { path: '', component: RutaListComponent },
  { path: 'nueva', component: RutaFormComponent },
  { path: 'editar/:id', component: RutaFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RutasRoutingModule { }
