import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { Observable, catchError, map, of, startWith, takeUntil } from 'rxjs';

import { Destroyer } from '../../base/destroyer';
import { IAccChurn } from '../../models/home/home.model';
import { MatPaginator } from '@angular/material/paginator';

import { HomeServices } from '../home/services/home.service';
import { MatSort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { AnalyticsClientsService } from './services/analytics-clients.service';
import { listOfCities } from './analytics-clients.mock';
import * as XLSX from 'xlsx';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-analytics-clients',
  templateUrl: './analytics-clients.component.html',
  styleUrls: ['./analytics-clients.component.less'],
})
export class AnalyticsClientsComponent extends Destroyer implements OnInit {
  tableData: IAccChurn[] = [];
  dataSource: MatTableDataSource<IAccChurn>;
  isLoading = false;
  isFiltersActive = false;
  displayedColumns: string[] = [
    'client_id',
    'npo_account_id',
    'churn_prop',
    'gender',
    'age',
    'region',
    'npo_accnts_nmbr',
    'pmnts_type',
    'balance',
    'lst_pmnt_date_per_qrtr',
    'phone_number',
    'email',
    'lk',
  ];

  listOfLk: string[] = [
    "Да", "Нет", "Все"
  ]

  topItems: any
  
  names: string[] = [
    'ID клиента',
    'ID счета клиента',
    'Склонность к оттоку',
    'Пол',
    'Возраст клиента',
    'Регион',
    'Число счетов клиента',
    'Тип взносов',
    'Баланс счета',
    'Дата последнего взноса в квартале',
    'Наличие номера телефона',
    'Наличие email',
    'Маркер наличия ЛК',
  ];

  selectedRegion = 'Все';
  selectedLc = 'Все';

  listOfCities = listOfCities;

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    if (this.dataSource && mp) this.dataSource.paginator = mp;
  }

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    if (this.dataSource && ms) this.dataSource.sort = ms;
  }
  filteredOptions: Observable<string[]>;
  filteredRegOptions: Observable<string[]>;
  lcControl = new FormControl();
  regControl = new FormControl();
  constructor(
    private _homeService: AnalyticsClientsService,
    private _liveAnnouncer: LiveAnnouncer
  ) {
    super();
    this.filteredOptions = this.lcControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );

    this.filteredRegOptions = this.regControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterReg(value))
    );
    this.dataSource = new MatTableDataSource<IAccChurn>(this.tableData);
  }

  private _filterReg(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listOfCities.filter(option => option.toLowerCase().includes(filterValue));
  }


  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listOfLk.filter(option => option.toLowerCase().includes(filterValue));
  }

  applyRegionFilter() {
    this.isFiltersActive = true;

    this.selectedRegion = this.regControl.value
    this.selectedLc = this.lcControl.value 
    
    let filteredData = this.tableData.filter(item => {
      const regionFilter = this.selectedRegion === 'Все' || item.region.toUpperCase() === this.selectedRegion.toUpperCase();
      const lcFilter = this.selectedLc === 'Все' || item.lk.toUpperCase() === this.selectedLc.toUpperCase();
  
      return regionFilter && lcFilter;
    });
  
    // Сортировка отфильтрованных данных по полю item.lk в порядке убывания
    filteredData.sort((a, b) => {
      if (a.churn_prop > b.churn_prop) {
        return -1;
      }
      if (a.churn_prop < b.churn_prop) {
        return 1;
      }
      return 0;
    });
  
    // Выбор первых topItems значений
    filteredData = filteredData.slice(0, this.topItems);
  
    this.dataSource.data = filteredData;
  
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  exportToExcel(): void {
    const allData = this.dataSource.data;
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(allData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'Топ клиентов по склонности к оттоку.xlsx');
  }
  getSortActionDescription(column: string): string {
    // Реализация метода getSortActionDescription

    return 'Описание для сортировки ' + column;
  }

  getColumnHeader(index: number): string {
    // Реализация метода getColumnHeader
    return this.names[index];
  }

  ngOnInit(): void {
    this.getDataForTable();
  }

  getDataForTable(): void {
    this.isLoading = true;
    this._homeService
      .getAccChurn()
      .pipe(
        takeUntil(this.destroy$),
        catchError((e: any) => {
          if (e.error.detail) {
            console.log(e);
          } else {
            console.log(
              'Ошибка',
              'Ошибка при обращении к серверу приложения, пожалуйста, обратитесь к администратору.'
            );
          }
          return of(null);
        })
      )
      .subscribe((response) => {
        if (response) {
          this.tableData = response;
          this.dataSource.data = this.tableData;
        }

        this.isLoading = false;
      });
  }

  announceSortChange(sortState: any) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
}
