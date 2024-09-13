import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule),
  },
  { 
    path: 'demand-forecasting', 
    loadChildren: () => import('./pages/analytics/analytics.module').then(m => m.AnalyticsModule),
  },
  { 
    path: 'analytics-clients', 
    loadChildren: () => import('./pages/analytics-clients/analytics-clients.module').then(m => m.AnalyticsClientsModule),
  },
  { 
    path: 'upload', 
    loadChildren: () => import('./pages/upload/upload.module').then(m => m.UploadModule),
  },
  // { 
  //   path: 'integration', 
  //   loadChildren: () => import('./pages/integration/integration.module').then(m => m.IntegrationModule),
  // },

];
