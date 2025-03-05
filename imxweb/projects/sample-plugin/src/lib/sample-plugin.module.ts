import { NgModule } from '@angular/core';
import { SamplePluginComponent } from './sample-plugin.component';
import { SamplePluginService } from './sample-plugin.service';
import { TilesModule } from 'qer';
import { TileModule, RouteGuardService,DataSourceToolbarModule,HelpContextualModule} from 'qbm';
import { EmployeesReportingToMeComponent } from './employees-reporting-to-me/employees-reporting-to-me.component';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule  } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { EmployeesSidesheetComponent } from './employees-sidesheet/employees-sidesheet.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { EuiCoreModule } from '@elemental-ui/core';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';



const routes:Routes =[
  {
    path:'employees-reporting-to-me',
    component: EmployeesReportingToMeComponent,
    canActivate : [RouteGuardService],
    resolve:[RouteGuardService],
  }
]



@NgModule({
  declarations: [
    SamplePluginComponent,
    EmployeesReportingToMeComponent,
    EmployeesSidesheetComponent
  ],
  imports: [
    TilesModule,
    CommonModule,
    DataSourceToolbarModule,
    HelpContextualModule ,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule ,
    MatInputModule,
    TranslateModule,
    MatDatepickerModule,
    FormsModule,
    MatProgressSpinnerModule,
    EuiCoreModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    SamplePluginComponent
  ]
})
export class SamplePluginModule { 
  constructor(private readonly initializer :SamplePluginService){
    console.log('In constructor of SamplePluginModule.');
    this.initializer.onInit(routes);
    console.log('SamplePluginModule initialized');
  }
  
}
