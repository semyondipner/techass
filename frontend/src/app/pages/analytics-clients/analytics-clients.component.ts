import { Component, } from '@angular/core';

import { Observable } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { Destroyer } from '../../base/destroyer';
import { AnalyticsClientsService } from './services/analytics-clients.service';

@Component({
  selector: 'app-analytics-clients',
  templateUrl: './analytics-clients.component.html',
  styleUrls: ['./analytics-clients.component.less'],
})
export class AnalyticsClientsComponent extends Destroyer {
  public stores$!: Observable<{ store_id: string }[]>;
  public items$!: Observable<{ item_id: string }[]>;
  public filters!: FormGroup;

  constructor(
    private _analyticsClientsService: AnalyticsClientsService
  ) {
    super();
    this.stores$ = this._analyticsClientsService.getStores();
    this.items$ = this._analyticsClientsService.getItems();
    this.filters = new FormGroup({
      store: new FormControl([]),
      item: new FormControl([]),
    });
  }

}
