import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URLs } from '../../../base/urls';
import { IAccChurn } from '../../../models/home/home.model';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  constructor(private _httpClient: HttpClient) {}

  getData() {
    return this._httpClient.get<IAccChurn[]>(URLs.churn.years);
  }

  uploadfile(file: File) {
    let formParams = new FormData();
    formParams.append('file', file)
    return this._httpClient.post('', formParams)
  }

  // getSingleDomen1(item: number) {
  //   return this._httpClient.get<IHome[]>(URLs.domen1.method1 + `/${item}`);
  // }

  // createUser(item: IHome) {
  //   return this._httpClient.post(URLs.domen1.method1, item);
  // }

  // updateDomen1(item: IHome) {
  //   return this._httpClient.put(URLs.domen1.method1, item);
  // }

  // deleteDomen1(item: number) {
  //   return this._httpClient.delete(URLs.domen1.method1 + `/${item}`);
  // }
}
