import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { Observable, catchError, map, of, startWith, takeUntil } from 'rxjs';
   
import { Destroyer } from '../../base/destroyer';

import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexAnnotations,
  ApexFill,
  ApexStroke,
  ApexGrid
} from "ng-apexcharts";
import { MatSnackBar } from '@angular/material/snack-bar';
import { AnalyticsService, DayPrediction, Prediction, PredictionsResponse } from './services/analytics.service';

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

export class AnalyticsComponent extends Destroyer implements OnInit{
  public isLoading = true;
  chartData: any = []

  chartOptions: Partial<ChartOptions> | any= {};

  constructor(
    private _cdr: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private _analyticsService: AnalyticsService
  ) {
    super()
  }

  ngOnInit(): void {
    this.getPredictions()
  }

  getPredictions() {
    this.isLoading = true;
    this._analyticsService
        .getPredictions()
        .pipe(
            catchError((err: any) => {
                const errorMessage = err.error && err.error.detail ? err.error.detail : "Произошла ошибка при загрузке файла.";
                this.openSnackBar(errorMessage, "Закрыть");
                return of(null);
            })
        )
        .subscribe((response: PredictionsResponse | null) => {
            if (response) {
                this.chartData = response.predictions;

                this.updateChartOptions();

                this._cdr.detectChanges();
                this.isLoading = false;
            }
        });
}
updateChartOptions(): void {
  // Извлекаем данные для графика


  const dates: string[] = [];
    const medianData: number[] = [];
    const lowData: number[] = [];
    const highData: number[] = [];
    this.chartData.forEach((prediction: Prediction) => {
        prediction.day_prediction.forEach((day: DayPrediction) => {
            dates.push(this.formatDate(day.date));
            medianData.push(day.median);
            lowData.push(day.low);
            highData.push(day.high);
        });
    });


  this.chartOptions = {
      series: [
          {
              name: "Прогноз (медиана)",
              data: medianData
          },
          {
              name: "Нижняя граница",
              data: lowData
          },
          {
              name: "Верхняя граница",
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
              text: 'Значение'
          },
          labels: {
              formatter: (value: number) => value.toFixed(2)
          }
      },
      tooltip: {
          shared: true,
          intersect: false,
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "horizontal",
          shadeIntensity: 0.25,
          gradientToColors: undefined,
          inverseColors: true,
          opacityFrom: 0.85,
          opacityTo: 0.85,
        }
      },
      colors: ["#00E396", "#FF4560", "#008FFB"] 
  };
  this.isLoading = false;

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


