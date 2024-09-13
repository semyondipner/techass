import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// import { HomeServices } from './services/home.service';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';


@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    MatTableModule,
    HttpClientModule,
    CommonModule,
    RouterModule,
    HomeRoutingModule,
    MatButtonModule
  ],

})
export class HomeModule { }