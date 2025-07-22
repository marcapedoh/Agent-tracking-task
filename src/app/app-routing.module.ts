import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './component/login/login.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { DailyTrackingComponent } from './component/daily-tracking/daily-tracking.component';
import { InactiveDetailsComponent } from './component/inactive-details/inactive-details.component';
import { HistoryComponent } from './component/history/history.component';
import { ReportComponent } from './component/report/report.component';
import { CompaignsComponent } from './component/compaigns/compaigns.component';

const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
    children: [
      {
        path: "dashboard",
        component: DashboardComponent
      },
      {
        path: "daily-tracking",
        component: DailyTrackingComponent
      },
      {
        path: "daily-tracking/inactive-detail",
        component: InactiveDetailsComponent
      },
      {
        path: "history",
        component: HistoryComponent
      },
      {
        path: "reports",
        component: ReportComponent
      },
      {
        path: "compaigns",
        component: CompaignsComponent
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
