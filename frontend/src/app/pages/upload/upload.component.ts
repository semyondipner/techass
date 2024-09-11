import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { catchError, of, takeUntil } from 'rxjs';
   
import { Destroyer } from '../../base/destroyer';
import { IChurnYears } from '../../models/home/home.model';
import { MatPaginator } from '@angular/material/paginator';

import { HomeServices } from '../home/services/home.service';
import { MatSort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { UploadService } from './services/upload.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.less']
})

export class UploadComponent extends Destroyer {

  file: File | null = null;
 

  constructor(
    private _uploadService: UploadService
  ){
    super();
  }


  onFilechange(event: any) {
    this.file = event.target.files[0]
  }
  
  upload() {
    if (this.file) {
      this._uploadService.uploadfile(this.file).subscribe(resp => {
        alert("Загружено")
      })
    } else {
      alert("Выберите файл")
    }
  }


}
