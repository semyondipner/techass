import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URLs } from '../../../base/urls';
import { Observable } from 'rxjs';

export interface Prediction {
  item_id: string;
  cnt: string;
  date: string;
}

export interface Pred {
  date: Date | string,
  low: number,
  median: number,
  high: number,
  item_id: "string"
}

export interface PredictionsResponse {
  predictions: Prediction[];
}

export interface PredResponse {
  predictions: Pred[];
}


@Injectable({
  providedIn: 'root'
})

export class AnalyticsService {
  constructor(private _httpClient: HttpClient) {}

  
  getHistory(item_id: string): Observable<PredictionsResponse> {
    return this._httpClient.get<PredictionsResponse>(URLs.prediction.predict + `?item_id=${item_id}`);
  }

  getPredictions(item_id: string): Observable<PredResponse> {
    return this._httpClient.get<PredResponse>(URLs.prediction.pred + `?item_id=${item_id}`);
  }
  

  getItems() {
    return this._httpClient.get<{ item_id: string }[]>(URLs.analytics.items);
  }
}
