import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URLs } from '../../../base/urls';
import { Observable } from 'rxjs';

export interface DayPrediction {
  date: string;
  low: number;
  median: number;
  high: number;
}

export interface Prediction {
  item_id: string;
  store_id: string;
  prediction_date: string;
  day_prediction: DayPrediction[];
}

export interface PredictionsResponse {
  predictions: Prediction[];
}

@Injectable({
  providedIn: 'root'
})

export class AnalyticsService {
  constructor(private _httpClient: HttpClient) {}

  
  getPredictions(): Observable<PredictionsResponse> {
    return this._httpClient.get<PredictionsResponse>(URLs.prediction.predict);
  }
}
