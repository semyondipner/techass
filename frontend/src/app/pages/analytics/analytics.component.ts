import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { Destroyer } from '../../base/destroyer';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexAnnotations,
  ApexFill,
  ApexStroke,
  ApexGrid
} from "ng-apexcharts";
import { MatSnackBar } from '@angular/material/snack-bar';
import { AnalyticsService, PredictionsResponse, PredResponse } from './services/analytics.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';


export interface HistoryEntry {
  date: string;
  cnt: number;
}

export interface PredictionEntry {
  date: string;
  low: number;
  median: number;
  high: number;
}

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
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.less']
})
export class AnalyticsComponent extends Destroyer {
  public isLoading = false;
  public filters!: FormGroup;
  public items$!: Observable<{ item_id: string }[]>;
  chartOptions: Partial<ChartOptions> | any = {};
  isAnalyticsExist = false;

  private historyData: HistoryEntry[] = []; // Хранит данные от getHistory
  private predictionsData: PredictionEntry[] = []; // Хранит данные от getPredictions
  public displayedColumnsPredictions: string[] = ['date', 'low', 'median', 'high'];
  public dataTablePredictions = new MatTableDataSource<any>([]);

  @ViewChild('paginatorPredictions') paginatorPredictions!: MatPaginator;
  
  constructor(
    private _cdr: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private _analyticsService: AnalyticsService
  ) {
    super();
    this.items$ = this._analyticsService.getItems();
    this.filters = new FormGroup({
      item_id: new FormControl([], Validators.required),
    });
  }

  createReport() {
    const item_id = this.filters.get('item_id')?.value;

    if (item_id) {
      // this.getHistory(item_id);
      this.getPredictions(item_id);
    } else {
      this.openSnackBar("Данные выбраны неверно", "Закрыть");
    }
  }

  getHistory(item_id: string) {
    this.isLoading = true;
    this._analyticsService
      .getHistory(item_id)
      .pipe(
        catchError((err: any) => {
          const errorMessage = err.error && err.error.detail ? err.error.detail : "Произошла ошибка при загрузке файла.";
          this.openSnackBar(errorMessage, "Закрыть");
          return of(null);
        })
      )
      .subscribe((response: PredictionsResponse | null) => {
        if (response && Array.isArray(response)) {
          this.historyData = response; // Сохраняем данные истории
          this.updateChartOptions();
          this.isAnalyticsExist = true;
        } else {
          this.openSnackBar("Нет данных для отображения.", "Закрыть");
        }
        this.isLoading = false;
        this._cdr.detectChanges();
      });
  }

  getPredictions(item_id: string) {
    this.isLoading = true;
    this._analyticsService
      .getPredictions(item_id)
      .pipe(
        catchError((err: any) => {


          const errorMessage = err.error && err.error.detail ? err.error.detail : "Произошла ошибка при загрузке файла.";
          this.openSnackBar(errorMessage, "Закрыть");
          return of(null);
        })
      )
      .subscribe((response: PredResponse | null) => {
        if (response && Array.isArray(response)) {
          this.predictionsData = response; // Сохраняем данные прогноза
          this.updateChartOptions();
          this.populatePredictionsTable(); // Заполняем таблицу данными
  
          this.isAnalyticsExist = true;
        } else {
          this.openSnackBar("Нет данных для отображения.", "Закрыть");
        }
        this.isLoading = false;
        this._cdr.detectChanges();
      });
  }

  populatePredictionsTable() {
    const formattedData = this.predictionsData.map((prediction: PredictionEntry) => ({
      date: this.formatDate(prediction.date),
      low: prediction.low,
      median: prediction.median,
      high: prediction.high,
    }));
  
  
  this.dataTablePredictions.data = formattedData; 
  
  setTimeout(() => {this.dataTablePredictions.paginator = this.paginatorPredictions
      this._cdr.detectChanges();
  })
  }

  applyFilter(event: Event, dataSource: MatTableDataSource<any>) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    dataSource.filter = filterValue;
  
    if (dataSource.paginator) {
      dataSource.paginator.firstPage();
    }
  }
  
  updateChartOptions(): void {
    const dates: string[] = [];
    const lowData: number[] = [];
    const medianData: number[] = [];
    const highData: number[] = [];
  
    // Заполняем данные только из getPredictions
    if (Array.isArray(this.predictionsData)) {
      this.predictionsData.forEach((prediction: PredictionEntry) => {
        const predictionDate = new Date(prediction.date);
        const formattedDate = this.formatDate(prediction.date);
  
        // Добавляем уникальные даты
        if (!dates.includes(formattedDate)) {
          dates.push(formattedDate);
          // Заполняем данные low, median и high для этой даты
          lowData.push(Number(prediction.low.toFixed(4))); // Округляем до 4 знаков
          medianData.push(Number(prediction.median.toFixed(4))); // Округляем до 4 знаков
          highData.push(Number(prediction.high.toFixed(4))); // Округляем до 4 знаков
        }
      });
    }
  
    // Настройка параметров графика
    this.chartOptions = {
      series: [
        {
          name: "Нижняя граница прогноза",
          data: lowData
        },
        {
          name: "Прогнозное значение (медиана)",
          data: medianData
        },
        {
          name: "Верхняя граница прогноза",
          data: highData
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
        width: [2, 2, 2],
        curve: 'smooth'
      },
      grid: {
        row: {
          colors: ["#fff", "#f2f2f2"]
        }
      },
      xaxis: {
        categories: dates,
        tickPlacement: "on",
      },
      yaxis: {
        title: {
          text: 'Значения'
        },
        labels: {
          formatter: (value: number) => value !== null ? value.toFixed(4) : value
        }
      },
      tooltip: {
        shared: true,
        intersect: false,
      },
      fill: {
        type: "solid",
      },
      colors: ["#7F7F7F", "#B0B0B0", "#5F5F5F"] // разные оттенки серого
    };
  
    // Обновляем график
    this._cdr.detectChanges();
  }
  formatDate(dateString: string): string {
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
