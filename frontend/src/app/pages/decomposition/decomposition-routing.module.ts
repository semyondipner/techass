import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DecompositionComponent } from './decomposition.component';

const routes: Routes = [
  {
    path: '',
    component: DecompositionComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DecompositionRoutingModule { }