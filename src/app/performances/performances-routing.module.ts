import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PerformanceListComponent } from './performance-list/performance-list.component';
import { PerformanceFormComponent } from './performance-form/performance-form.component';

const routes: Routes = [
  { path: '', component: PerformanceListComponent },
  { path: 'nueva', component: PerformanceFormComponent },
  { path: 'editar/:id', component: PerformanceFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PerformancesRoutingModule { }
