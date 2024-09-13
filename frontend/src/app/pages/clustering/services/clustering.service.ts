import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URLs } from '../../../base/urls';

@Injectable({
  providedIn: 'root'
})
export class СlusteringService {
  constructor(private _httpClient: HttpClient) {}

  getStores() {
    return this._httpClient.get<{ store_id: string }[]>(URLs.analytics.analytics);
  }

  getClusters(){
    return this._httpClient.get<number[]>(URLs.prediction.clusters);
  }

  getClustering(store_id:string, cluster:string) {
    return this._httpClient.get< {
      "store_id": string,
      "cnt": number,
      "date": Date
    }[]>(URLs.prediction.clustering + `?cluster=${cluster}&store_id=${store_id}`);
  }

   
}
