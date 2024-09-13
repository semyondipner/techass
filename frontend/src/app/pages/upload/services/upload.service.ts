import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URLs } from '../../../base/urls';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  constructor(private _httpClient: HttpClient) {}

  uploadfile(file: File) {
    let formParams = new FormData();
    formParams.append('file', file);
    return this._httpClient.post(URLs.prediction.upload, formParams);
  }
}
