import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AnalyticsClientsRoutingModule } from './analytics-clients-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { AnalyticsClientsComponent } from './analytics-clients.component';
import { AnalyticsClientsService } from './services/analytics-clients.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AnalyticsClientsComponent
  ],
  imports: [
    HttpClientModule,
    CommonModule,
    RouterModule,
    AnalyticsClientsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatFormFieldModule, 
    MatSelectModule,
    MatAutocompleteModule,
    

  ],
  providers: [
    AnalyticsClientsService
  ]
})
export class AnalyticsClientsModule { }