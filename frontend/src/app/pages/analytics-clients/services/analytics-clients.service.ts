import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URLs } from '../../../base/urls';

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

  postKpis(store_ids: string[], items_ids: string[], date_str: Date | string, date_end: Date | string) {
    return this._httpClient.post(URLs.analytics.kpis, {
      'store_ids': store_ids,
      'items_ids': items_ids,
      'date_str': date_str,
      'date_end': date_end
    }); 
  }

  postTables(store_ids: string[], items_ids: string[], date_str: Date | string, date_end: Date | string) {
    return this._httpClient.post<any>(URLs.analytics.tables, {
      'store_ids': store_ids,
      'items_ids': items_ids,
      'date_str': date_str,
      'date_end': date_end
    }); 
  }

  postCharts(store_ids: string[], items_ids: string[], date_str: Date | string, date_end: Date | string) {
    return this._httpClient.post(URLs.analytics.charts, {
      'store_ids': store_ids,
      'items_ids': items_ids,
      'date_str': date_str,
      'date_end': date_end
    }); 
  }

  
}
