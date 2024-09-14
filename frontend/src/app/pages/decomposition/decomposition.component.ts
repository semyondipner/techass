import { ChangeDetectorRef, Component, ViewChild, AfterViewInit } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DecompositionService } from './services/decomposition.service';
import { DateAdapter } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexPlotOptions, ApexYAxis, ApexAnnotations, ApexFill, ApexStroke, ApexGrid } from 'ng-apexcharts';
import { Destroyer } from '../../base/destroyer';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: any; // ApexXAxis;
  annotations: ApexAnnotations;
  fill: ApexFill;
  stroke: ApexStroke;
  grid: ApexGrid;
};

@Component({
  selector: 'app-decomposition',
  templateUrl: './decomposition.component.html',
  styleUrls: ['./decomposition.component.less'],
})
export class DecompositionComponent extends Destroyer implements AfterViewInit {
  public stores$!: Observable<{ item_id: string }[]>;
  public filters!: FormGroup;
  public isAnalyticsExist = false;
  public isLoading = false;
  chartData: any = [];
  public displayedColumnsShopSales: string[] = ['store_id', 'cnt', 'date'];

  public columnHeaderMapping: { [key: string]: string } = {
    store_id: 'Магазин',
    cnt: 'Суммарные продажи по кластеру',
    date: 'Дата'
  };

  dataTableItemSales = new MatTableDataSource<any>([]);
  dataTableShopSales = new MatTableDataSource<any>([]);
  salesChartOptions: Partial<ChartOptions> | any = {};
  trendChartOptions: Partial<ChartOptions> | any = {};
  seasonalityChartOptions: Partial<ChartOptions> | any = {};

  @ViewChild('paginatorShopSales') paginatorShopSales!: MatPaginator;

  constructor(
    private _clusteringService: DecompositionService,
    private _dateAdapter: DateAdapter<Date>,
    private _datePipe: DatePipe,
    private _snackBar: MatSnackBar,
    private _cdr: ChangeDetectorRef
  ) {
    super();
    this.stores$ = this._clusteringService.getItems();
    this.filters = new FormGroup({
      store_id_item: new FormControl([], Validators.required),
    });

    this._dateAdapter.setLocale('ru');
  }

  ngAfterViewInit(): void {
    this.dataTableShopSales.paginator = this.paginatorShopSales;
  }

  createReport() {
    const store_id_item = this.filters.get('store_id_item')?.value;

    if (store_id_item) {
      this.getDecomposition(store_id_item);
    } else {
      this.openSnackBar("Данные выбраны неверно", "Закрыть");
    }
  }

  getDecomposition(store_id_item: string): void {
    this.isLoading = true;
    this._clusteringService.getDecomposition(store_id_item).pipe(
      catchError((err: any) => {
        const errorMessage = err.error && err.error.detail ? err.error.detail : "Произошла ошибка при загрузке файла.";
        this.openSnackBar(errorMessage, "Закрыть");
        return of(null);
      })
    ).subscribe((response) => {
      if (response) {
        this.chartData = response;
        this.postDecompositionData(response); // Вызов метода для обработки данных декомпозиции
        this.updateChartOptions();
        this._cdr.detectChanges();
        this.isAnalyticsExist = true;
        this._cdr.detectChanges();
        this.isLoading = false;

        this._cdr.detectChanges();
      } else {
        this.isLoading = false; // Убедитесь, что загрузка останавливается при отсутствии данных
      }
    });
  }
  
  postDecompositionData(data: { store_item_id: string, cnt: number, date: Date, trend: number, seasonality: number }[]): void {
    const formattedData = data.map(item => ({
      store_id: item.store_item_id,
      cnt: item.cnt,
      date: this.formatDate(item.date),
    }));
  
    this.dataTableShopSales = new MatTableDataSource(formattedData); // Инициализация MatTableDataSource с отформатированными данными

    setTimeout(() => this.dataTableShopSales.paginator = this.paginatorShopSales)
  }

  postClusteringData(data: { store_id: string, cnt: number, date: Date }[]): void {
    const formattedData = data.map(item => ({
      store_id: item.store_id,
      cnt: item.cnt,
      date: this.formatDate(item.date),
    }));

    this.dataTableShopSales = new MatTableDataSource(formattedData);
    setTimeout(() => {
      this.dataTableShopSales.paginator = this.paginatorShopSales;
      this._cdr.detectChanges();
    });

    this.isLoading = false;
    this.isAnalyticsExist = true;
    this._cdr.detectChanges();
  }

  applyFilter(event: Event, dataSource: MatTableDataSource<any>) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    dataSource.filter = filterValue;

    if (dataSource.paginator) {
      dataSource.paginator.firstPage();
    }
  }

  updateChartOptions(): void {
    const dates = this.chartData.map((entry: any) => this.formatDate(entry.date));
    const salesCounts = this.chartData.map((entry: any) => entry.cnt);
    const trends = this.chartData.map((entry: any) => entry.trend);
    const seasonalities = this.chartData.map((entry: any) => entry.seasonality);

    // График продаж
    this.salesChartOptions = {
      series: [{
        name: "Продажи",
        data: salesCounts,
      }],
      chart: {
        height: 300,
        type: "line",
        zoom: {
          type: "x",
          enabled: true,
          autoScaleYaxis: true
        },
        animations: {
          enabled: false  // Отключаем анимацию
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 2,
        curve: 'smooth'
      },
      xaxis: {
        categories: dates,
        tickPlacement: "on"
      },
      yaxis: {
        title: {
          text: 'Суммарные продажи'
        },
        labels: {
          formatter: (value: number) => value.toFixed(0)
        }
      },
      tooltip: {
        shared: true,
        intersect: false,
      },
      colors: ["#008FFB"] // Один цвет для линии
    };

    // График тренда
    this.trendChartOptions = {
      series: [{
        name: "Тренд",
        data: trends,
      }],
      chart: {
        height: 300,
        type: "line",
        zoom: {
          type: "x",
          enabled: true,
          autoScaleYaxis: true
        },
        animations: {
          enabled: false  // Отключаем анимацию
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 2,
        curve: 'smooth'
      },
      xaxis: {
        categories: dates,
        tickPlacement: "on"
      },
      yaxis: {
        title: {
          text: 'Тренд'
        },
        labels: {
          formatter: (value: number) => value.toFixed(2)
        }
      },
      tooltip: {
        shared: true,
        intersect: false,
      },
      colors: ["#FF4560"] // Один цвет для линии
    };

    // График сезонности
    this.seasonalityChartOptions = {
      series: [{
        name: "Сезонность",
        data: seasonalities,
      }],
      chart: {
        height: 300,
        type: "line",
        zoom: {
          type: "x",
          enabled: true,
          autoScaleYaxis: true
        },
        animations: {
          enabled: false  // Отключаем анимацию
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 2,
        curve: 'smooth'
      },
      xaxis: {
        categories: dates,
        tickPlacement: "on"
      },
      yaxis: {
        title: {
          text: 'Сезонность'
        },
        labels: {
          formatter: (value: number) => value.toFixed(2)
        }
      },
      tooltip: {
        shared: true,
        intersect: false,
      },
      colors: ["#00E396"] // Один цвет для линии
    };
  }

  formatDate(dateString: string | Date): string {
    const date = new Date(dateString);
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
    });
  }
}
