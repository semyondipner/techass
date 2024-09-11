import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URLs } from '../../../base/urls';
import { IAccChurn, IChurnYears } from '../../../models/home/home.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsClientsService {
  constructor(private _httpClient: HttpClient) {}

  getData() {
    return this._httpClient.get<IChurnYears[]>(URLs.churn.years);
  }

  getAccChurn() {
    return this._httpClient.get<IAccChurn[]>(URLs.churn.acc);
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
