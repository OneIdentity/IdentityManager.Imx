import { Injectable } from '@angular/core';
import { AppConfigService, AuthenticationService, ExtService, MenuItem, MenuService } from 'qbm';
import { SamplePluginComponent } from './sample-plugin.component';
import { Route, Router } from '@angular/router';
import { MethodDescriptor, TimeZoneInfo } from 'imx-qbm-dbts';

interface PersonInfo{
  FirstName:string;
  LastName:string;
  UID_Person:string;
}

interface ValidationError{
  column:string;
  errorMsg:string;
}


@Injectable({
  providedIn: 'root'
})
export class SamplePluginService {
  myemployees:number;
  thereareemployees:boolean=false;
  

  constructor(private readonly extService : ExtService,
              private readonly router: Router,
              private readonly menuService: MenuService,
              private readonly authentication: AuthenticationService,
              private readonly config : AppConfigService
  ) { 
    this.extService.register('Dashboard-SmallTiles',{instance:SamplePluginComponent});
    this.authentication.onSessionResponse.subscribe({
      next: sessionState => {
        if (sessionState?.IsLoggedOut) {
          this.thereareemployees=false;
        } else if (sessionState?.IsLoggedIn) {
          this.HasReportingEmployees();
          this.setupMenu();
        }
      }
    });

   }

  public onInit(routes: Route[]):void{
    this.addRoutes(routes);
    // this.HasReportingEmployees();
    // this.setupMenu();
    
  }

  private addRoutes(routes: Route[]): void {
      const config = this.router.config;
      routes.forEach((route) => {
        config.unshift(route);
      });
      this.router.resetConfig(config);
  }

  private setupMenu(): void {
      
      
      this.menuService.addMenuFactories(() => {
        if( this.thereareemployees){
          const menu: MenuItem = {
            id: 'ROOT_Employees',
            title: '#LDS#Employees',
            sorting: '20',
            items: [
              {
                id: 'EMP_Employees_ReportingToMe',
                route: 'employees-reporting-to-me',
                title: '#LDS#Reporting to me',
                sorting: '20-10',
              },
              
            ],
          };
          return menu;
        }

        },
       
      );
    }
    
    public async HasReportingEmployees():Promise<boolean>{
      let employees =await this.HowManyEmployees();
     
      this.thereareemployees=employees>0;

      return employees>0;
    }
    

    public async HowManyEmployees():Promise<number> {
      
      const employees= await this.config.apiClient.processRequest<number>(this.GetReportingToMePeople("reporting-to-me/amount"));
      return employees

    }

    public async ReportingToMePeople():Promise<PersonInfo[]>{
      let myValues=await this.config.apiClient.processRequest<PersonInfo[]>(this.GetReportingToMePeople("reporting-to-me"));
      return myValues;
    }
  
    private GetReportingToMePeople(path :string):MethodDescriptor<void> {
      return {
        path:`/portal/${path}`,
        parameters:[],
        method: 'GET',
        headers: {
          'imx-timezone':TimeZoneInfo.get(),
        },
        credentials:'include',
        observe:'response',
        responseType:'json',
      };
    }

    

    private convertData(filteredFormValues){
      let finalData={
        columns:Object.keys(filteredFormValues).map(key=>({
          column:key,
          value:filteredFormValues[key]
        }))
      };
      
      return finalData;
    }

    

    public async PostApi(endpoint:string,data:any):Promise<string>{
      let result=await this.config.apiClient.processRequest(this.validateAPIcall(endpoint,this.convertData(data)));
      return result.toString();
    }

    private validateAPIcall(endpoint:string ,data :any):MethodDescriptor<ValidationError[]>{
      return {
        path:`/portal/${endpoint}`,
        parameters:[
          {
            name:'data',
            value: data,
            in:'body'
          },
      ],
        method: 'POST',
        headers: {
          'imx-timezone':TimeZoneInfo.get(),
        },
        credentials:'include',
        observe:'response',
        responseType:'json',
      };
    }

    
}
