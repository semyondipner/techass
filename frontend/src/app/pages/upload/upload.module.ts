import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { UploadRoutingModule } from './upload-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { UploadComponent } from './upload.component';
import { UploadService } from './services/upload.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    UploadComponent
  ],
  imports: [
    HttpClientModule,
    CommonModule,
    RouterModule,
    UploadRoutingModule,

    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatButtonModule,


  ],
  providers: [
    UploadService
  ]
})
export class UploadModule { }