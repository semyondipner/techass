import { ChangeDetectorRef, Component, ViewChild, AfterViewInit } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { СlusteringService } from './services/clustering.service';
import { DateAdapter } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexPlotOptions, ApexYAxis, ApexAnnotations, ApexFill, ApexStroke, ApexGrid } from 'ng-apexcharts';
import { Destroyer } from '../../base/destroyer';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: any; //ApexXAxis;
  annotations: ApexAnnotations;
  fill: ApexFill;
  stroke: ApexStroke;
  grid: ApexGrid;
};

@Component({
  selector: 'app-clustering',
  templateUrl: './clustering.component.html',
  styleUrls: ['./clustering.component.less'],
})
export class СlusteringComponent extends Destroyer implements AfterViewInit {
  public stores$!: Observable<{ store_id: string }[]>;
  public clusters$!: Observable<number[]>;
  public filters!: FormGroup;
  public isAnalyticsExist = false;
  public isLoading = false;
  chartData: any = []
  public displayedColumnsShopSales: string[] = ['store_id', 'cnt', 'date'];

  // Optionally, if you want to define headers in a mapping
  public columnHeaderMapping: { [key: string]: string } = {
    store_id: 'Магазин',
    cnt: 'Суммарные продажи по кластеру',
    date: 'Дата'
  };


  dataTableItemSales = new MatTableDataSource<any>([]);

  dataTableShopSales = new MatTableDataSource<any>([]);

  chartOptions: Partial<ChartOptions> | any = {};
  chartOptionsGmv: Partial<ChartOptions> | any = {};

  @ViewChild('paginatorShopSales') paginatorShopSales!: MatPaginator;

  constructor(
    private _clusteringService: СlusteringService,
    private _dateAdapter: DateAdapter<Date>,
    private _datePipe: DatePipe,
    private _snackBar: MatSnackBar,
    private _cdr: ChangeDetectorRef
  ) {
    super()
    this.stores$ = this._clusteringService.getStores();
    this.clusters$ = this._clusteringService.getClusters();
    this.filters = new FormGroup({
      store_id: new FormControl([], Validators.required),
      cluster: new FormControl([], Validators.required),
    });

    this._dateAdapter.setLocale('ru');
  }

  ngAfterViewInit(): void {
    this.dataTableShopSales.paginator = this.paginatorShopSales; // Set paginator after view initialization
  }


  createReport() {
    const store_id = this.filters.get('store_id')?.value;
    const cluster = this.filters.get('cluster')?.value;

    if (store_id && cluster) {
      this.getClustering(store_id, cluster);

    } else {
      this.openSnackBar("Данные выбраны неверно", "Закрыть");
    }
  }

  getClustering(store_id: string, cluster: string): void {
    this.isLoading = true;
    this._clusteringService.getClustering(store_id, cluster).pipe(
      catchError((err: any) => {
        const errorMessage = err.error && err.error.detail ? err.error.detail : "Произошла ошибка при загрузке файла.";
        this.openSnackBar(errorMessage, "Закрыть");
        return of(null);
      })
    ).subscribe((response) => {
      if (response) {
        this.chartData = response;
        this.postClusteringData(response);  // Call method to process clustering data
        this.updateChartOptions();
        this._cdr.detectChanges();
        this.isAnalyticsExist = true;

        this._cdr.detectChanges();
      }
    });
  }

  postClusteringData(data: { store_id: string, cnt: number, date: Date }[]): void {
    const formattedData = data.map(item => ({
        store_id: item.store_id,
        cnt: item.cnt,
        date: this.formatDate(item.date),
    }));

    // Сортируем данные по дате
    formattedData.sort((a: { date: string }, b: { date: string }) => new Date(a.date).getTime() - new Date(b.date).getTime());

    this.dataTableShopSales = new MatTableDataSource(formattedData); // Initialize MatTableDataSource with formatted data

    setTimeout(() => {
        this.dataTableShopSales.paginator = this.paginatorShopSales;
        this._cdr.detectChanges();
    });

    this.isLoading = false;
    this.isAnalyticsExist = true; // Show analytics if loaded

    this._cdr.detectChanges(); // Force change detection if needed
}



  applyFilter(event: Event, dataSource: MatTableDataSource<any>) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    dataSource.filter = filterValue;

    if (dataSource.paginator) {
      dataSource.paginator.firstPage();
    }
  }


  updateChartOptions(): void {
    const startDate = this.filters.get('startDate')?.value;
    const endDate = this.filters.get('endDate')?.value;

    // Фильтрация данных по дате
    const filteredData = this.chartData.filter((entry: any) => {
        const entryDate = new Date(entry.date);
        const isAfterStartDate = !startDate || entryDate >= new Date(startDate);
        const isBeforeEndDate = !endDate || entryDate <= new Date(endDate);
        return isAfterStartDate && isBeforeEndDate;
    });

    // Сортируем отфильтрованные данные по дате
    filteredData.sort((a: { date: string }, b: { date: string }) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Если после фильтрации и сортировки данных длина массива равна нулю, нужно обработать это
    if (filteredData.length === 0) {
        this.chartOptions = {
            series: [],
            // Остальные параметры графика можно сбросить или задать значения по умолчанию
        };
        return; // Не продолжайте выполнение, если нет данных для отображения
    }

    const dates = filteredData.map((entry: any) => this.formatDate(entry.date));
    const salesCounts = filteredData.map((entry: any) => entry.cnt);

    this.chartOptions = {
        series: [
            {
                name: "Кластеризация",
                data: salesCounts,
            }
        ],
        chart: {
            height: 500,
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
                text: 'Суммарные продажи по кластеру'
            },
            labels: {
                formatter: (value: number) => value.toFixed(0)  // Форматирование
            }
        },
        tooltip: {
            shared: true,
            intersect: false,
        },
        colors: ["#008FFB"] // Один цвет для линии
    };

    // Обновляем график
    this._cdr.detectChanges();
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
