import { Component,  Injectable, OnInit } from '@angular/core';
import {  Router } from '@angular/router';
import {  imx_SessionService } from 'qbm';
import {RequestsService} from 'qer';
import { SamplePluginService } from './sample-plugin.service';



Injectable({providedIn:'root'})
@Component({
  selector: 'imx-sample-plugin',
  templateUrl:'./sample-plugin.component.html',
  styleUrls: ['./sample-plugin.component.scss']
})
export class SamplePluginComponent implements OnInit {
  
  actionText:string ="";
  thereAreEmployees:boolean;
  howManyEmployees:number;
 

  constructor(
    public requestsService:RequestsService,
    public readonly sessionService:imx_SessionService,
    public router:Router,
    private readonly samplePluginService :SamplePluginService
  ) {
     
   }

  async ngOnInit(): Promise<void> {
    console.log("SamplePluginComponent -> onInit")
    this.actionText=(await this.sessionService.getSessionState()).Username
    this.thereAreEmployees=await this.samplePluginService.HasReportingEmployees();
    this.howManyEmployees=await this.samplePluginService.HowManyEmployees();

  }

  

  public GoToRequestHistory() :void {
    this.router.navigate(['employees-reporting-to-me']);
  }

  




}
