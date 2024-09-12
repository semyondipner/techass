import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URLs } from '../../../base/urls';
import { IAccChurn, IChurnYears } from '../../../models/home/home.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsClientsService {
  constructor(private _httpClient: HttpClient) {}

  getStores() {
    return this._httpClient.get<{ store_id: string }[]>(URLs.analytics.analytics);
  }

  getItems() {
    return this._httpClient.get<{ item_id: string }[]>(URLs.analytics.items);
  }

}
