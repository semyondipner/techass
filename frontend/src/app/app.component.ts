import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { DateAdapter } from '@angular/material/core';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MatNativeDateModule, MatFormFieldModule, FormsModule, ReactiveFormsModule, JsonPipe, MatFormFieldModule, RouterOutlet, MatDividerModule, MatListModule, RouterModule, MatIconModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'Techass';

  listMain = [
    { name: 'Файлы', isActive: false, url: '/upload', png: 'downloading' },
    // { name: 'Интеграции', isActive: false, url: '/integration', png: 'warning' },
    // { name: 'Каталог интеграций', isActive: false, url: '/upload', png: 'downloading' },
    // { name: 'Управления интеграциями', isActive: false, url: '/upload', png: 'downloading' },
  ];


  listAnalytics = [
    { name: 'Аналитика покупок', isActive: true, url: '/analytics-clients', png: 'dot-chart' },
    { name: 'Прогнозирование спроса', isActive: false, url: '/demand-forecasting', png: 'regression' },
    { name: 'Кластеризация товаров', isActive: false, url: '/clustering', png: 'radio-waves' },
    { name: 'Декомпозиция', isActive: false, url: '/decomposition', png: 'discount' },
    // { name: 'ABCXYZ-анализ', isActive: false, url: '/analytics-clients', png: 'abc-2' },
    // { name: 'Детектирование аномалий', isActive: false, url: '/churn-years', png: 'warning' },
 
    // { name: 'Спектральный анализ', isActive: false, url: '', png: 'radio-waves' },
  ];

  constructor(private router: Router, private _fb: FormBuilder, private _dateAdapter: DateAdapter<Date>) {
    const list = [...this.listMain, ...this.listAnalytics]

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.url;
        list.forEach(item => {
          item.isActive = item.url === currentUrl;
        });
      }
    });

    const elements = document.querySelectorAll('.mdc-list-item__content::before');
    elements.forEach(element => {
      element.textContent = ''; 
    });
  }

  scrollToTop() {
    window.scroll({
      top: 0,
      behavior: "smooth",
    });
  }
}
