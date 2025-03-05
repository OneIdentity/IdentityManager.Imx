import { Component, Inject, OnInit } from '@angular/core';
import { EUI_SIDESHEET_DATA, EuiSidesheetRef } from '@elemental-ui/core';
import { SamplePluginService } from '../sample-plugin.service';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'imx-employees-sidesheet',
  templateUrl: './employees-sidesheet.component.html',
  styleUrls: ['./employees-sidesheet.component.scss']
})
export class EmployeesSidesheetComponent implements OnInit {
  employeeFirstName:string;
  employeeLastName:string;
  employeeUID_Person:string;
  customProperty:string='';
  isLoading:boolean=false;
  dateproblem=false;
  date4 = new FormControl('');

  endpoint="employee/update2";
  mydata={
    UID_Person:"",
    ExitDate:"",
    CustomProperty: ""
  };

  constructor(
    private readonly samplePluginService :SamplePluginService,
    private snackBar: MatSnackBar,
    @Inject(EUI_SIDESHEET_DATA) public data: any 
  ) {
    if (data) {
      this.employeeFirstName = data.employeeFirstName;
      this.employeeLastName = data.employeeLastName;
      this.employeeUID_Person = data.employeeUID_Person;
      this.mydata.UID_Person=this.employeeUID_Person;
    }
  }

  ngOnInit(): void {
  }


  async update(){
    this.mydata.CustomProperty=this.customProperty;
    const dateObject=new Date(this.date4.value.toString());
    const currentDate=new Date();
    if(dateObject.toString()!=='Invalid Date'){
      this.mydata.ExitDate=this.changeTheDate(dateObject);
      if(currentDate<dateObject){
        this.dateproblem=false;
        this.isLoading=true;
        let result= await this.samplePluginService.PostApi(this.endpoint,this.mydata);
        this.isLoading=false;
        this.showSnackBar(result); 
      }else{
        this.dateproblem=true;
      }
    }else{
      this.isLoading=true;
      let result= await this.samplePluginService.PostApi(this.endpoint,this.mydata);
      console.log(result);
      this.isLoading=false;
      this.showSnackBar(result);  
    }
    
    
}

  changeTheDate(dateObject:Date):string{
    const day = String(dateObject.getDate()).padStart(2, '0'); 
    const month = String(dateObject.getMonth() + 1).padStart(2, '0'); 
    const year = dateObject.getFullYear();

    let formattedDate = `${month}/${day}/${year}`;

    return formattedDate;
  }

  dateFilter(date: moment.Moment): boolean {
    if (!date) {
      return false;
    }
    const day = date.weekday();
    return day !== 0 && day !== 6; 
  }
  


  showSnackBar(alertMsg:string) {
    this.snackBar.open(alertMsg, 'OK');
  }

}
