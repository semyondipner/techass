import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { СlusteringComponent } from './clustering.component';

const routes: Routes = [
  {
    path: '',
    component: СlusteringComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class СlusteringRoutingModule { }