import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RutasRoutingModule } from './rutas-routing.module';
import { RutaListComponent } from './ruta-list/ruta-list.component';
import { RutaFormComponent } from './ruta-form/ruta-form.component';

@NgModule({
  declarations: [
    RutaListComponent,
    RutaFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RutasRoutingModule
  ]
})
export class RutasModule { }
