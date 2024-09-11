import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AnalyticsRoutingModule } from './analytics-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { AnalyticsComponent } from './analytics.component';
import { AnalyticsService } from './services/analytics.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import {MatTabsModule} from '@angular/material/tabs'

@NgModule({
  declarations: [
    AnalyticsComponent
  ],
  imports: [
    HttpClientModule,
    CommonModule,
    RouterModule,
    AnalyticsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule, 
    MatSelectModule,
    MatProgressSpinnerModule,
    NgApexchartsModule,
    MatAutocompleteModule,

  ],
  providers: [
    AnalyticsService
  ]
})
export class AnalyticsModule { }