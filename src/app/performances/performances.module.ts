import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PerformancesRoutingModule } from './performances-routing.module';
import { PerformanceListComponent } from './performance-list/performance-list.component';
import { PerformanceFormComponent } from './performance-form/performance-form.component';

@NgModule({
  declarations: [
    PerformanceListComponent,
    PerformanceFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PerformancesRoutingModule
  ]
})
export class PerformancesModule { }
