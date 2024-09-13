// import { Component, OnInit, ViewChild } from '@angular/core';
// import { MatTableDataSource, MatTableModule } from '@angular/material/table';

// import { Observable, catchError, map, of, startWith, takeUntil } from 'rxjs';
   
// import { Destroyer } from '../../base/destroyer';
// import { IChurnYears, IRegion } from '../../models/home/home.model';
// import { MatPaginator } from '@angular/material/paginator';

// import { HomeServices } from '../home/services/home.service';
// import {
//   ApexAxisChartSeries,
//   ApexChart,
//   ChartComponent,
//   ApexDataLabels,
//   ApexPlotOptions,
//   ApexYAxis,
//   ApexAnnotations,
//   ApexFill,
//   ApexStroke,
//   ApexGrid
// } from "ng-apexcharts";
// import { listOfCities } from '../analytics-clients/analytics-clients.mock';
// import { FormControl } from '@angular/forms';

// export type ChartOptions = {
//   series: ApexAxisChartSeries;
//   chart: ApexChart;
//   dataLabels: ApexDataLabels;
//   plotOptions: ApexPlotOptions;
//   yaxis: ApexYAxis;
//   xaxis: any; //ApexXAxis;
//   annotations: ApexAnnotations;
//   fill: ApexFill;
//   stroke: ApexStroke;
//   grid: ApexGrid;
// };

// @Component({
//   selector: 'app-analytics',
//   templateUrl: './integration.component.html',
//   styleUrls: ['./integration.component.less']
// })

// export class IntegrationComponent extends Destroyer implements OnInit {
//   tableData: IChurnYears[] = [];
//   regionsData: IRegion[] = [];
//   @ViewChild("chart") chart!: ChartComponent;
//   chartOptionsBalance: Partial<ChartOptions> | any= {};
//   chartOptionsLst: Partial<ChartOptions> | any= {};
//   chartOptions: Partial<ChartOptions> | any= {};
//   isLoading: boolean = false;
//   listOfCities = listOfCities;
//   dataSource: MatTableDataSource<IChurnYears>;
//   dataSourceReg: MatTableDataSource<IRegion>;
//   filteredRegOptions: Observable<string[]>;
//   selectedRegion: string | null = null;
//   isFiltersActive = false;
//   regControl = new FormControl();

//   constructor(private _homeService: HomeServices) {
//     super();

//     this.filteredRegOptions = this.regControl.valueChanges.pipe(
//       startWith(''),
//       map(value => this._filterReg(value))
//     );

//     this.dataSource = new MatTableDataSource<IChurnYears>(this.tableData);

//     this.dataSourceReg = new MatTableDataSource<IRegion>(this.regionsData);
//   }

//   private _filterReg(value: string): string[] {
//     const filterValue = value.toLowerCase();
//     return this.listOfCities.filter(option => option.toLowerCase().includes(filterValue));
//   }


//   ngOnInit(): void {
//     this.getDataForTable();
//     this.getRegions();
//   }


//   applyRegionFilter() {
//     this.selectedRegion = this.regControl.value
//     if (this.selectedRegion) {
//       this.isFiltersActive = true;

//       this.dataSource.filter = this.selectedRegion.trim().toUpperCase();
//       this.dataSourceReg.filter = this.selectedRegion.trim().toUpperCase();
//       this.updateChartOptions(); 
//       this.updateChartOptionsBalance();
//       this.updateChartOptionsLst()
//     } 
//   }

//   getDataForTable(): void {
//     this.isLoading = true;
//     this._homeService
//       .getData()
//       .pipe(
//         takeUntil(this.destroy$),
//         catchError((e: any) => {
//           if (e.error.detail) {
//             console.log(e);
//           } else {
//             console.log('Ошибка');
//           }
//           return of(null);
//         })
//       )
//       .subscribe((response) => {
//         if (response) {
//           this.tableData = response.filter(entry => {
//             // Получаем текущий год
//             const currentYear = 2022;
//             // Оставляем только данные за последние 5 лет
//             return entry.year >= currentYear - 4;
//           });
      
//           this.dataSource.data = this.tableData;

//           // Обновляем настройки графика после получения данных

//         }
//         this.isLoading = false;
//       });
//   }

//   getRegions(): void {
//     this.isLoading = true;
//     this._homeService
//       .getRegions()
//       .pipe(
//         takeUntil(this.destroy$),
//         catchError((e: any) => {
//           if (e.error.detail) {
//             console.log(e);
//           } else {
//             console.log('Ошибка');
//           }
//           return of(null);
//         })
//       )
//       .subscribe((response) => {
//         if (response) {
//           this.regionsData = response;
//           console.log(response);
      
//           this.dataSourceReg.data = this.regionsData;

//         }
//         this.isLoading = false;
//       });
//   }

  
//   updateChartOptions(): void {
//     const filteredData = this.tableData.filter(entry => entry.region.trim().toUpperCase() === this.selectedRegion);

//     this.chartOptions = {
//       series: this.getSeriesData(filteredData),
//       annotations: {},
//       chart: {
//         height: 500,
//         type: "bar"
//       },
//       plotOptions: {
//         bar: {
//           columnWidth: "50%",
//         }
//       },
//       dataLabels: {
//         enabled: false
//       },
//       stroke: {
//         width: 2
//       },
//       grid: {
//         row: {
//           colors: ["#fff", "#f2f2f2"]
//         }
//       },
//       xaxis: {
//         labels: {
//         },
//         categories: this.getXCategories(filteredData),
//         tickPlacement: "on"
//       },
//       yaxis: {
//         title: {
//         },
//         labels: {
//           formatter: function(value: any) {
//             return value.toFixed(3); // Округляем значение до двух знаков
//           }
//       }
//       },
//       fill: {
//         type: "gradient",
//         gradient: {
//           shade: "light",
//           type: "horizontal",
//           shadeIntensity: 0.25,
//           gradientToColors: undefined,
//           inverseColors: true,
//           opacityFrom: 0.85,
//           opacityTo: 0.85,
//         }
//       }
//     };
// }


// updateChartOptionsBalance(): void {
//   const filteredData = this.regionsData.filter(entry => entry.region.trim().toUpperCase() === this.selectedRegion);

//   this.chartOptionsBalance = {
//     series: this.getSeriesDataBalance(filteredData),
//     annotations: {},
//     chart: {
//       height: 500,
//       type: "bar"
//     },
//     plotOptions: {
//       bar: {
//         columnWidth: "50%",
//         borderColor: "#D36AB9" 
//       }
//     },
//     dataLabels: {
//       enabled: false
//     },
//     stroke: {
//       width: 2,
//       colors: ["#A76AD2",
//       "#CA6AD2",
//       "#D36AB9"]
//     },
//     grid: {
//       row: {
//         colors: ["#fff", "#f2f2f2"]
//       }
//     },
//     xaxis: {
//       labels: {
//       },
//       categories: this.getXCategoriesBalance(filteredData),
//       tickPlacement: "on"
//     },
//     yaxis: {
//       title: {
//       },
//       labels: {
//         formatter: function(value: any) {
//           return value.toFixed(2); // Округляем значение до двух знаков
//         }
//     }
//     },
//     fill: {
//       type: "gradient",
//       gradient: {
//         shade: "light",
//         type: "horizontal",
//         shadeIntensity: 0.25,
//         gradientToColors: undefined,
//         inverseColors: true,
//         opacityFrom: 0.85,
//         opacityTo: 0.85,
//       },
//       colors: ["#A76AD2",
//       "#CA6AD2",
//       "#D36AB9"]

   
//     }
//   };
// }


// updateChartOptionsLst(): void {
//   const filteredData = this.regionsData.filter(entry => entry.region.trim().toUpperCase() === this.selectedRegion);

//   this.chartOptionsLst = {
//     series: this.getSeriesDataLst(filteredData),
//     annotations: {},
//     chart: {
//       height: 500,
//       type: "bar"
//     },
//     plotOptions: {
//       bar: {
//         columnWidth: "50%",
//         borderColor: "#00A98F" 
//       }
//     },
//     dataLabels: {
//       enabled: false
//     },
//     stroke: {
//       width: 2,
//       colors: ["#00A81F",
//       "#00A857",
//       "#00A98F"]
//     },
//     grid: {
//       row: {
//         colors: ["#fff", "#f2f2f2"]
//       }
//     },
//     xaxis: {
//       labels: {
//       },
//       categories: this.getXCategoriesLst(filteredData),
//       tickPlacement: "on"
//     },
//     yaxis: {
//       title: {
//       },
//       labels: {
//         formatter: function(value: any) {
//           return value.toFixed(2); // Округляем значение до двух знаков
//         }
//     }
//     },
//     fill: {
//       type: "gradient",
//       gradient: {
//         shade: "light",
//         type: "horizontal",
//         shadeIntensity: 0.25,
//         gradientToColors: undefined,
//         inverseColors: true,
//         opacityFrom: 0.85,
//         opacityTo: 0.85,
//       },
//       colors: ["#00A81F",
//         "#00A857",
//         "#00A98F"]
//     },
//   };
// }

// getXCategoriesBalance(data: IRegion[]): string[] {
//     return data.map(entry => entry.quarter);
// }

// getSeriesDataBalance(data: IRegion[]): ApexAxisChartSeries {
//     return [{
//         name: "Сумма балансов по оттоку",
//         data: data.map(entry => ({
//             x: entry.quarter,
//             y: entry.balance
//         }))
//     }];
// }

// getXCategoriesLst(data: IRegion[]): string[] {
//   return data.map(entry => entry.quarter);
// }

// getSeriesDataLst(data: IRegion[]): ApexAxisChartSeries {
//   return [{
//       name: "Сумма взносов по оттоку",
//       data: data.map(entry => ({
//           x: entry.quarter,
//           y: entry.lst_pmnt
//       }))
//   }];
// }

// getXCategories(data: IChurnYears[]): string[] {
//   return data.map(entry => entry.quarter);
// }

// getSeriesData(data: IChurnYears[]): ApexAxisChartSeries {
//   return [{
//       name: "Процент оттока клиентов",
//       data: data.map(entry => ({
//           x: entry.quarter,
//           y: entry.churn
//       }))
//   }];
// }

// }


