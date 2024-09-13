import { ChangeDetectorRef, Component, ViewChild, AfterViewInit } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AnalyticsClientsService } from './services/analytics-clients.service';
import { DateAdapter } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

interface ColumnHeaderMapping {
  [key: string]: string;
}

interface ItemSale {
  item_id: string;
  uniq_item_sale: number;
  sales: number;
  gmv: number;
}

interface ShopItemSale {
  store_id: string;
  item_id: string;
  sales: number;
  gmv: number;
}

interface ShopSale {
  store_id: string;
  uniq_item_sale: number;
  sales: number;
  gmv: number;
}

interface ColumnMappings {
  table_item_sales: ColumnHeaderMapping;
  table_shop_item_sales: ColumnHeaderMapping;
  table_shop_sales: ColumnHeaderMapping;
}

@Component({
  selector: 'app-analytics-clients',
  templateUrl: './analytics-clients.component.html',
  styleUrls: ['./analytics-clients.component.less'],
})
export class AnalyticsClientsComponent implements AfterViewInit {
  public stores$!: Observable<{ store_id: string }[]>;
  public items$!: Observable<{ item_id: string }[]>;
  public data_stores$ = [{ store_id: 'PostgreSQL' }];
  public filters!: FormGroup;
  public kpis: any;
  public isAnalyticsExist = false;
  public isLoading = false;

  columnHeaderMapping: ColumnMappings = {
    table_item_sales: {
      item_id: 'Товар',
      uniq_item_sale: 'Количество уникальных магазинов для проданных товаров',
      sales: 'Количество продаж',
      gmv: 'Выручка',
    },
    table_shop_item_sales: {
      store_id: 'Магазин',
      item_id: 'Товар',
      sales: 'Количество продаж',
      gmv: 'Выручка',
    },
    table_shop_sales: {
      store_id: 'Магазин',
      uniq_item_sale: 'Количество уникальных проданных товаров',
      sales: 'Количество продаж',
      gmv: 'Выручка',
    },
  };

  displayedColumnsItemSales = ['item_id', 'uniq_item_sale', 'sales', 'gmv'];
  dataTableItemSales = new MatTableDataSource<any>([]);

  displayedColumnsShopItemSales = ['store_id', 'item_id', 'sales', 'gmv'];
  dataTableShopItemSales = new MatTableDataSource<any>([]);

  displayedColumnsShopSales = ['store_id', 'uniq_item_sale', 'sales', 'gmv'];
  dataTableShopSales = new MatTableDataSource<any>([]);

  @ViewChild('paginatorItemSales') paginatorItemSales!: MatPaginator;
  @ViewChild('sortItemSales') sortItemSales!: MatSort;

  @ViewChild('paginatorShopItemSales') paginatorShopItemSales!: MatPaginator;
  @ViewChild('sortShopItemSales') sortShopItemSales!: MatSort;

  @ViewChild('paginatorShopSales') paginatorShopSales!: MatPaginator;
  @ViewChild('sortShopSales') sortShopSales!: MatSort;

  constructor(
    private _analyticsClientsService: AnalyticsClientsService,
    private _dateAdapter: DateAdapter<Date>,
    private _datePipe: DatePipe,
    private _snackBar: MatSnackBar,
    private _cdr: ChangeDetectorRef
  ) {
    this.stores$ = this._analyticsClientsService.getStores();
    this.items$ = this._analyticsClientsService.getItems();
    this.filters = new FormGroup({
      store_ids: new FormControl([], Validators.required),
      items_ids: new FormControl([], Validators.required),
      date_str: new FormControl(null, Validators.required),
      date_end: new FormControl(null, Validators.required),
    });

    this._dateAdapter.setLocale('ru');
  }

  ngAfterViewInit(): void {
    this.dataTableItemSales.paginator = this.paginatorItemSales;
    this.dataTableItemSales.sort = this.sortItemSales;

    this.dataTableShopItemSales.paginator = this.paginatorShopItemSales;
    this.dataTableShopItemSales.sort = this.sortShopItemSales;

    this.dataTableShopSales.paginator = this.paginatorShopSales;
    this.dataTableShopSales.sort = this.sortShopSales;
  }

  createReport() {
    const store_ids = this.filters.get('store_ids')?.value.includes('All') ? 'All' : this.filters.get('store_ids')?.value;
    const items_ids = this.filters.get('items_ids')?.value.includes('All') ? 'All' : this.filters.get('items_ids')?.value;
    const date_str = this._datePipe.transform(this.filters.get('date_str')?.value, 'yyyy-MM-dd');
    const date_end = this._datePipe.transform(this.filters.get('date_end')?.value, 'yyyy-MM-dd');

    if (store_ids && items_ids && date_str && date_end) {
      this.postKpis(store_ids, items_ids, date_str, date_end);

    } else {
      this.openSnackBar("Данные выбраны неверно", "Закрыть");
    }
  }

  postKpis(store_ids: string[], items_ids: string[], date_str: Date | string, date_end: Date | string): void {
    this.isLoading = true;
    this._analyticsClientsService
      .postKpis(store_ids, items_ids, date_str, date_end)
      .pipe(
        catchError((err: any) => {
          const errorMessage = err.error && err.error.detail ? err.error.detail : "Произошла ошибка при загрузке файла.";
          this.openSnackBar(errorMessage, "Закрыть");
          return of(null);
        })
      ).subscribe((response) => {
        if (response) {
          this.postCharts(store_ids, items_ids, date_str, date_end);
          this.kpis = response;
          this._cdr.detectChanges();
        }
      });
  }

  postTables(store_ids: string[], items_ids: string[], date_str: Date | string, date_end: Date | string): void {
    this._analyticsClientsService
      .postTables(store_ids, items_ids, date_str, date_end)
      .pipe(
        catchError((err: any) => {
          const errorMessage = err.error && err.error.detail ? err.error.detail : "Произошла ошибка при загрузке файла.";
          this.openSnackBar(errorMessage, "Закрыть");
          return of(null);
        })
      )
      .subscribe((response) => {
        if (response) {
          this.dataTableItemSales.data = response.table_item_sales.data.map((row: any[]): ItemSale => ({
            item_id: row[0],
            uniq_item_sale: row[1],
            sales: row[2],
            gmv: row[3],
          }));
          this.displayedColumnsItemSales = response.table_item_sales.columns;

          this.dataTableShopItemSales.data = response.table_shop_item_sales.data.map((row: any[]): ShopItemSale => ({
            store_id: row[0],
            item_id: row[1],
            sales: row[2],
            gmv: row[3],
          }));
          this.displayedColumnsShopItemSales = response.table_shop_item_sales.columns;

          this.dataTableShopSales.data = response.table_shop_sales.data.map((row: any[]): ShopSale => ({
            store_id: row[0],
            uniq_item_sale: row[1],
            sales: row[2],
            gmv: row[3],
          }));
          this.displayedColumnsShopSales = response.table_shop_sales.columns;

          // Установите пагинаторы после назначения данных
          this.dataTableItemSales.paginator = this.paginatorItemSales;
          this.dataTableShopItemSales.paginator = this.paginatorShopItemSales;
          this.dataTableShopSales.paginator = this.paginatorShopSales;

          // Обновляем вид
          this._cdr.detectChanges();
        }
      });
  }

  applyFilter(event: Event, dataSource: MatTableDataSource<any>) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    dataSource.filter = filterValue;

    if (dataSource.paginator) {
      dataSource.paginator.firstPage();
    }
  }

  postCharts(store_ids: string[], items_ids: string[], date_str: Date | string, date_end: Date | string): void {
    this._analyticsClientsService
      .postCharts(store_ids, items_ids, date_str, date_end)
      .pipe(
        catchError((err: any) => {
          const errorMessage = err.error && err.error.detail ? err.error.detail : "Произошла ошибка при загрузке файла.";
          this.openSnackBar(errorMessage, "Закрыть");
          return of(null);
        })
      )
      .subscribe((response) => {
        if (response) {
          this.isAnalyticsExist = true;
          this.postTables(store_ids, items_ids, date_str, date_end);

          this.isLoading = false;
          this._cdr.detectChanges();
        }
      });
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
    });
  }
}
