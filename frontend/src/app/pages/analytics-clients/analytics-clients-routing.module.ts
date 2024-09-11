import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnalyticsClientsComponent } from './analytics-clients.component';

const routes: Routes = [
  {
    path: '',
    component: AnalyticsClientsComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnalyticsClientsRoutingModule { }