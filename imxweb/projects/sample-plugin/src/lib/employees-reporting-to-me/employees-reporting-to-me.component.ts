import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { SamplePluginService } from '../sample-plugin.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { EmployeesSidesheetComponent } from '../employees-sidesheet/employees-sidesheet.component';

interface PersonInfo{
  FirstName:string;
  LastName:string;
  UID_Person:string;
}


@Component({
  selector: 'imx-employees-reporting-to-me',
  templateUrl: './employees-reporting-to-me.component.html',
  styleUrls: ['./employees-reporting-to-me.component.scss']
})
export class EmployeesReportingToMeComponent implements OnInit ,AfterViewInit  {
  
  displayedColumns: string[] = [];
  dataSource=new  MatTableDataSource<PersonInfo>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private readonly samplePluginService :SamplePluginService,
              private readonly sideSheet: EuiSidesheetService,
              private readonly translate: TranslateService
  ) { 
    

    // Assign the data to the data source for the table to render
    this.samplePluginService.ReportingToMePeople().then((data)=>{
      this.dataSource.data =data;
      if (data.length > 0) {
        this.displayedColumns = Object.keys(data[0]); 
      }
      
    })
    
  }

  ngOnInit(): void {
    this.samplePluginService.ReportingToMePeople();
    
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  

  public async openSidesheet(row:any): Promise<void> {
      this.sideSheet.open(EmployeesSidesheetComponent, {
        title: `${row.FirstName} ${row.LastName}'s Details`,
        padding: '0px',
        width: 'max(400px,45%)',
        data: { employeeFirstName: row.FirstName, employeeLastName: row.LastName,employeeUID_Person:row.UID_Person }
      });
    }

}

