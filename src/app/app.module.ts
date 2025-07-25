import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './component/login/login.component';
import { NavbarComponent } from './component/navbar/navbar.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { FooterComponent } from './component/footer/footer.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { DailyTrackingComponent } from './component/daily-tracking/daily-tracking.component';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { InactiveDetailsComponent } from './component/inactive-details/inactive-details.component';
import {HttpClientModule} from "@angular/common/http";
import { CompaignsComponent } from './component/compaigns/compaigns.component';
import { ReportComponent } from './component/report/report.component';
import { HistoryComponent } from './component/history/history.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    NavbarComponent,
    DashboardComponent,
    FooterComponent,
    DailyTrackingComponent,
    InactiveDetailsComponent,
    CompaignsComponent,
    ReportComponent,
    HistoryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgApexchartsModule,
    HttpClientModule,
    LeafletModule,
    FormsModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
