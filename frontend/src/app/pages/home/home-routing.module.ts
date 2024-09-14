import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'demand-forecasting',
    loadChildren: () => import('../analytics/analytics.module').then(m => m.AnalyticsModule)
  },
  { 
    path: 'analytics-clients', 
    loadChildren: () => import('../analytics-clients/analytics-clients.module').then(m => m.AnalyticsClientsModule),
  },
  {
    path: 'upload',
    loadChildren: () => import('../upload/upload.module').then(m => m.UploadModule)
  },

  { 
    path: 'decomposition', 
    loadChildren: () => import('../decomposition/decomposition.module').then(m => m.DecompositionModule),
  },
  { 
    path: 'clustering', 
    loadChildren: () => import('../clustering/clustering.module').then(m => m.ClusteringModule),
  },
  // {
  //   path: 'integration',
  //   loadChildren: () => import('../integration/integration.module').then(m => m.IntegrationModule)
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }