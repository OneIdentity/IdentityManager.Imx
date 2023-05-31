import {Injectable} from '@angular/core';
import {Route, Router} from '@angular/router';
import {AuthenticationService, ExtService, MenuItem, MenuService} from 'qbm';
import {EuiSidesheetService} from '@elemental-ui/core';
import {TranslateService} from '@ngx-translate/core';
import {CreateNewIdentityComponent, IdentitiesService, ProjectConfigurationService, UserModelService} from 'qer';
import {OwnershipInformation} from 'imx-api-qer';

@Injectable({
  providedIn: 'root'
})
export class CccService {
  constructor(
    private readonly extService: ExtService,
    private readonly router: Router,
    private readonly menuService: MenuService,
    private readonly identitiesService: IdentitiesService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly configService: ProjectConfigurationService,
    private readonly userModelService: UserModelService,
    private readonly authService: AuthenticationService) {
  }

  public async onInit(routes: Route[]): Promise<void> {
    this.addRoutes(routes);
    // Ist notwenig sonst ist ownerships leer
    // TODO: Führt zu leichen wenn zwei user mit unterschiedlichen rechten sich nacheinander an/ab melden
    this.authService.onSessionResponse.subscribe(async session => {
      if (session.IsLoggedIn) {

        const ownerships = (await this.userModelService.getUserConfig()).Ownerships;
        this.setupMenu(ownerships);
      }
      if (session.IsLoggedOut){
        this.menuService.clearFactories();
      }
    });
  }

  public async createIdentity(): Promise<void> {
    return this.sideSheet.open(CreateNewIdentityComponent, {
      title: await this.translate.get('#LDS#Create External Identity').toPromise(),
      headerColour: 'iris-blue',
      bodyColour: 'asher-gray',
      padding: '0px',
      width: 'max(650px, 65%)',
      disableClose: true,
      testId: 'create-new-identity-sidesheet',
      icon: 'contactinfo',
      data: {
        selectedIdentity: await this.identitiesService.createEmptyEntity(),
        projectConfig: await this.configService.getConfig()
      }
    }).afterClosed().toPromise();
  }

  private addRoutes(routes: Route[]): void {
    const config = this.router.config;
    routes.forEach(route => {
      config.unshift(route);
    });
    this.router.resetConfig(config);
  }

  private setupMenu(ownerships: OwnershipInformation[]): void {
    this.menuService.addMenuFactories(
      (preProps: string[], groups: string[]) => {
        if (!preProps.includes('ITSHOP')) {
          return null;
        }
        const isCreator = this.isPersonCreator(groups);
        const isManager = this.isPersonManager(groups);
        const isContactCenterAgentMgr = this.isContactCenterAgentManager(groups);

        if (!isCreator && !isManager) {
          return null;
        }

        const items: MenuItem[] = [
          {
            id: 'ATT_NewIdentity',
            trigger: () => this.createIdentity(),
            title: '#LDS#Heading Create Identity',
            sorting: '20-10',
          }
        ];

        if (isManager) {
          items.push(
            {
              id: 'ATT_Identities',
              navigationCommands: {commands: ['resp', 'identities']},
              title: '#LDS#Heading My Direct Reports',
              sorting: '20-20',
            }
          );
        }

        if (isContactCenterAgentMgr) {
          items.push(
            {
              id: 'CCC_Identity',
              route: 'identity',
              title: '#LDS#Heading Import Identities',
              sorting: '20-30',
            }
          );
        }

        const menu: MenuItem = {
          id: 'CCC_Identities',
          title: '#LDS#Identities',
          sorting: '20',
          items
        };
        return menu;
      },
      (preProps: string[]) => {

        if (!preProps.includes('ITSHOP')) {
          return null;
        }

        if (ownerships.length < 1) {
          return null;
        }

        const items: MenuItem[] = [];
        // TODO: Menüwechsel untereinander kaputt (Problem liegt an gleicher Komponente (role service) nicht hier!)
        // https://stackoverflow.com/questions/47813927/how-to-refresh-a-component-in-angular
        if (this.isOwnerOf(ownerships, 'Department')) {
          items.push(
            {
              id: 'CCC_Department',
              navigationCommands: {commands: ['resp', 'Department']},
              title: '#LDS#Heading My Departments',
              sorting: '30-60',
            },
          );
        }

        if (this.isOwnerOf(ownerships, 'Locality')) {
          items.push(
            {
              id: 'CCC_Locality',
              navigationCommands: {commands: ['resp', 'Locality']},
              title: '#LDS#Heading My Localities',
              sorting: '30-70',
            },
          );
        }

        if (this.isOwnerOf(ownerships, 'ProfitCenter')) {
          items.push(
            {
              id: 'CCC_ProfitCenter',
              navigationCommands: {commands: ['resp', 'ProfitCenter']},
              title: '#LDS#Heading My Cost Centres',
              sorting: '30-80',
            },
          );
        }

        if (this.isOwnerOf(ownerships, 'AERole')) {
          items.push(
            {
              id: 'CCC_AERole',
              navigationCommands: {commands: ['resp', 'AERole']},
              title: '#LDS#Heading My AERoles',
              sorting: '30-90',
            },
          );
        }
        if (items.length === 0) {
          return null;
        }
        return {
          id: 'ROOT_Responsibilities',
          title: '#LDS#Responsibilities',
          sorting: '30',
          items
        };
      });
  }

  private isPersonManager(groups: string[]): boolean {
    return groups.find(item => item.toUpperCase() === 'VI_4_ALLMANAGER') != null;
  }

  private isPersonCreator(groups: string[]): boolean {
    return groups.find(item => item.toUpperCase() === 'CCC_4_PERSON_CREATOR') != null;
  }

  private isContactCenterAgentManager(groups: string[]): boolean {
    return groups.find(item => item.toUpperCase() === 'CCC_4_PERSON_CONTACTCENTERAGENTMANAGER') != null;
  }

  private isOwnerOf(ownerships: OwnershipInformation[], tableName: string): boolean {
    return ownerships.some(o => o.TableName === tableName);
  }
}
