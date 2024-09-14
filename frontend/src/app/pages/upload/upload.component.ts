import { Component } from '@angular/core';

import { Destroyer } from '../../base/destroyer';
import { UploadService } from './services/upload.service';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.less']
})

export class UploadComponent extends Destroyer {
  file: File | null = null;
  isFileExist = false;

  constructor(
    private _uploadService: UploadService,
    private _snackBar: MatSnackBar
  ) {
    super();
  }


  onFilechange(event: any) {
    this.file = event.target.files[0]
    this.isFileExist = true;

  }

  upload() {
    if (this.file) {
      this.openSnackBar('Дождитесь окончания загрузки, прежде чем покинуть страницу', "Закрыть");
      this._uploadService.uploadfile(this.file).subscribe({
        next: () => {
          this.openSnackBar("Файл загружен успешно", "Закрыть");
          this.isFileExist = false;
          this.file = null;
        },
        error: (err) => {
          const errorMessage = err.error && err.error.detail ? err.error.detail : "Произошла ошибка при загрузке файла.";
          this.openSnackBar(errorMessage, "Закрыть");
        }
      });

    } else {
      this.openSnackBar("Выберите файл", "Закрыть");
      this.isFileExist = false;
    }

  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 3000, verticalPosition: 'top',
      horizontalPosition: 'right'
    });
  }
}
