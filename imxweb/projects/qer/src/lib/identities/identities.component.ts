/*
 * ONE IDENTITY LLC. PROPRIETARY INFORMATION
 *
 * This software is confidential.  One Identity, LLC. or one of its affiliates or
 * subsidiaries, has supplied this software to you under terms of a
 * license agreement, nondisclosure agreement or both.
 *
 * You may not copy, disclose, or use this software except in accordance with
 * those terms.
 *
 *
 * Copyright 2024 One Identity LLC.
 * ALL RIGHTS RESERVED.
 *
 * ONE IDENTITY LLC. MAKES NO REPRESENTATIONS OR
 * WARRANTIES ABOUT THE SUITABILITY OF THE SOFTWARE,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE IMPLIED WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, OR
 * NON-INFRINGEMENT.  ONE IDENTITY LLC. SHALL NOT BE
 * LIABLE FOR ANY DAMAGES SUFFERED BY LICENSEE
 * AS A RESULT OF USING, MODIFYING OR DISTRIBUTING
 * THIS SOFTWARE OR ITS DERIVATIVES.
 *
 */

import { Component, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { PortalAdminPerson, PortalPersonReports, ProjectConfig, QerProjectConfig, ViewConfigData } from '@imx-modules/imx-api-qer';
import {
  CollectionLoadParameters,
  DataModel,
  DataModelProperty,
  DisplayColumns,
  EntitySchema,
  IClientProperty,
  TypedEntityCollectionData,
} from '@imx-modules/imx-qbm-dbts';
import {
  AuthenticationService,
  BusyService,
  calculateSidesheetWidth,
  ClassloggerService,
  DataSourceToolbarFilter,
  DataSourceToolbarViewConfig,
  DataTableGroupedData,
  DataViewInitParameters,
  DataViewSource,
  ExtService,
  HelpContextualValues,
  IExtension,
  ImxTranslationProviderService,
  ISessionState,
  MessageDialogComponent,
  SideNavigationComponent,
} from 'qbm';
import { QerPermissionsService } from '../admin/qer-permissions.service';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { ViewConfigService } from '../view-config/view-config.service';
import { CreateNewIdentityComponent } from './create-new-identity/create-new-identity.component';
import { IdentitiesReportsService } from './identities-reports.service';
import { IdentitiesService } from './identities.service';
import { IdentitySidesheetComponent } from './identity-sidesheet/identity-sidesheet.component';

@Component({
  selector: 'imx-data-explorer-identities',
  templateUrl: './identities.component.html',
  styleUrls: ['./identities.component.scss'],
  providers: [DataViewSource],
})
export class DataExplorerIdentitiesComponent implements OnInit, OnDestroy, SideNavigationComponent {
  @Input() public applyIssuesFilter = false;

  /**
   * If set to false the css class for the fullscreen view will be deactivated
   */
  @Input() public showFullscreen = true;

  /**
   * Sets the admin mode to show all identities
   */
  @Input() public isAdmin = false;
  @Input() public contextId: HelpContextualValues;

  /**
   * Selected person
   */
  public selectedPerson: PortalAdminPerson | PortalPersonReports;

  /**
   * Details of selected person
   */
  public selectedPersonDetail: PortalAdminPerson | PortalPersonReports;

  public currentUser: string;

  public entitySchemaPersonReports: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;
  public filterOptions: DataSourceToolbarFilter[] = [];
  public groupingOptions: DataModelProperty[] = [];
  public data: any;

  public groupData: { [key: string]: DataTableGroupedData } = {};
  public isManagerForPersons: boolean;
  public isPersonAdmin: boolean;
  public isCreationAllowed: boolean;
  public isAuditor: boolean;
  public extensions: IExtension[] = [];

  private projectConfig: ProjectConfig & QerProjectConfig;
  private displayedColumns: IClientProperty[] = [];
  private authorityDataDeleted$: Subscription;
  private sessionResponse$: Subscription;

  public busyService = new BusyService();
  private dataModel: DataModel;
  private viewConfig: DataSourceToolbarViewConfig;
  private get viewConfigPath(): string {
    return this.isAdmin ? 'admin/person' : 'person/reports';
  }
  @ViewChild('dynamicReport', { static: true, read: ViewContainerRef }) dynamicReport: ViewContainerRef;

  constructor(
    public translateProvider: ImxTranslationProviderService,
    public dataSource: DataViewSource<PortalAdminPerson | PortalPersonReports>,
    private readonly sideSheet: EuiSidesheetService,
    private readonly busyServiceElemental: EuiLoadingService,
    private readonly logger: ClassloggerService,
    private readonly configService: ProjectConfigurationService,
    private readonly dialog: MatDialog,
    private readonly identitiesService: IdentitiesService,
    private viewConfigService: ViewConfigService,
    private readonly translate: TranslateService,
    private readonly authService: AuthenticationService,
    qerPermissionService: QerPermissionsService,
    private identityReports: IdentitiesReportsService,
    private extService: ExtService,
  ) {
    this.authorityDataDeleted$ = this.identitiesService.authorityDataDeleted.subscribe(() => this.dataSource.updateState());

    this.sessionResponse$ = this.authService.onSessionResponse.subscribe(async (session: ISessionState) => {
      if (session.IsLoggedIn) {
        (this.currentUser = session.UserUid || ''), (this.isManagerForPersons = await qerPermissionService.isPersonManager());
        this.isPersonAdmin = await qerPermissionService.isPersonAdmin();
        this.isAuditor = await qerPermissionService.isAuditor();
      }
    });
  }

  public async ngOnInit(): Promise<void> {
    this.getDynamicMenuItems();
    await this.init();
  }

  public ngOnDestroy(): void {
    if (this.authorityDataDeleted$) {
      this.authorityDataDeleted$.unsubscribe();
    }

    if (this.sessionResponse$) {
      this.sessionResponse$.unsubscribe();
    }
  }

  public getDynamicMenuItems(): void {
    if (this.isAdmin) {
      this.extensions = this.extService.Registry['identityReports'];
    } else {
      this.extensions = this.extService.Registry['identityReportsManager'];
    }
  }

  // !!TODO - Fix mat menu dynamic report components
  // Create dynamic report components and call viewReport function
  public async showDynamicReport(extension: IExtension): Promise<void> {
    if (!extension.instance) {
      return;
    }
    const dynamicReportComponent = this.dynamicReport.createComponent<any>(extension.instance, { index: 0 });
    dynamicReportComponent.instance.referrer = this.currentUser;
    dynamicReportComponent.instance.inputData = extension.inputData;
    await dynamicReportComponent.instance.ngOnInit();
    if (dynamicReportComponent.instance.viewReport) {
      dynamicReportComponent.instance.viewReport();
    }
  }

  public async personsManagedReport(): Promise<void> {
    this.identityReports.personsManagedReport(this.currentUser, '#LDS#View identities you are directly responsible for');
  }

  /**
   * Occurs when user selects an identity.
   *
   * @param identity Selected identity.
   */
  public async onIdentityChanged(identity: PortalAdminPerson | PortalPersonReports): Promise<void> {
    const overlayRef = this.busyServiceElemental.show();

    try {
      this.logger.debug(this, `Selected identity changed`);
      this.logger.trace('New selected identity', identity);
      this.selectedPerson = identity;
      this.selectedPersonDetail = await this.getPersonDetails(this.selectedPerson.GetEntity().GetKeys()[0]);

      if (!this.selectedPersonDetail) {
        const dialogRef = this.dialog.open(MessageDialogComponent, {
          data: {
            ShowOk: true,
            Title: await this.translate.get('#LDS#Heading Load Object').toPromise(),
            Message: await this.translate
              .get('#LDS#The object cannot be loaded. The displayed data may differ from the actual state. The data will now be reloaded.')
              .toPromise(),
          },
          panelClass: 'imx-messageDialog',
        });

        await dialogRef.afterClosed().toPromise();
        // reload data
        return this.dataSource.updateState();
      }
      await this.viewIdentity(this.selectedPersonDetail);
    } finally {
      this.busyServiceElemental.hide(overlayRef);
    }
  }

  public async createNewIdentity(): Promise<void> {
    await this.sideSheet
      .open(CreateNewIdentityComponent, {
        title: await this.translate.get('#LDS#Heading Create Identity').toPromise(),
        padding: '0px',
        width: calculateSidesheetWidth(),
        disableClose: true,
        testId: 'create-new-identity-sidesheet',
        icon: 'contactinfo',
        data: {
          selectedIdentity: await this.identitiesService.createEmptyEntity(),
          projectConfig: this.projectConfig,
        },
      })
      .afterClosed()
      .toPromise();

    return this.dataSource.updateState();
  }

  private async init(): Promise<void> {
    const isBusy = this.busyService.beginBusy();

    this.entitySchemaPersonReports = this.identitiesService.personReportsSchema;
    try {
      this.projectConfig = await this.configService.getConfig();
      this.isCreationAllowed = this.projectConfig.PersonConfig?.EnableNewPerson ?? false;
      this.displayedColumns = [
        this.entitySchemaPersonReports.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
        this.entitySchemaPersonReports.Columns.IsSecurityIncident,
        this.entitySchemaPersonReports.Columns.UID_Department,
      ];

      if (!this.isAdmin) {
        this.displayedColumns.push(
          this.entitySchemaPersonReports.Columns.IdentityType,
          this.entitySchemaPersonReports.Columns.EmployeeType,
          this.entitySchemaPersonReports.Columns.IsExternal,
        );
      }

      // Ensure this column is always added last
      this.displayedColumns.push(this.entitySchemaPersonReports.Columns.XMarkedForDeletion);

      this.dataModel = this.isAdmin ? await this.identitiesService.getDataModelAdmin() : await this.identitiesService.getDataModelReport();

      this.viewConfig = await this.viewConfigService.getInitialDSTExtension(this.dataModel, this.viewConfigPath);
      const dataViewInitParameters: DataViewInitParameters<PortalAdminPerson | PortalPersonReports> = {
        execute: this.isAdmin
          ? (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<PortalAdminPerson>> =>
              this.identitiesService.getAllPersonAdmin(params, signal)
          : (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<PortalPersonReports>> =>
              this.identitiesService.getReportsOfManager(params, signal),
        schema: this.entitySchemaPersonReports,
        columnsToDisplay: this.displayedColumns,
        dataModel: this.dataModel,
        groupExecute: (column: string, params: CollectionLoadParameters, signal: AbortSignal) => {
          return this.identitiesService.getGroupedAllPerson(
            column,
            {
              PageSize: params.PageSize,
              StartIndex: 0,
              ...params,
            },
            signal,
          );
        },
        exportFunction: this.isAdmin ? this.identitiesService.exportAdminPerson() : this.identitiesService.exportPerson(),
        viewConfig: this.viewConfig,
        highlightEntity: (identity: PortalAdminPerson | PortalPersonReports) => {
          this.onIdentityChanged(identity);
        },
      };
      this.dataSource.init(dataViewInitParameters);
    } finally {
      isBusy.endBusy();
    }
  }

  public async updateConfig(config: ViewConfigData): Promise<void> {
    await this.viewConfigService.putViewConfig(config);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dataSource.viewConfig.set(this.viewConfig);
  }

  public async deleteConfigById(id: string): Promise<void> {
    await this.viewConfigService.deleteViewConfig(id);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dataSource.viewConfig.set(this.viewConfig);
  }

  private async getPersonDetails(id: string): Promise<PortalAdminPerson | PortalPersonReports> {
    this.logger.debug(this, `Retrieving details for admin person with id ${id}`);
    return this.isAdmin ? this.identitiesService.getAdminPerson(id) : (await this.identitiesService.getPersonInteractive(id)).Data[0];
  }

  private async viewIdentity(identity: PortalAdminPerson | PortalPersonReports): Promise<void> {
    await this.sideSheet
      .open(IdentitySidesheetComponent, {
        title: await this.translate.get('#LDS#Heading Edit Identity').toPromise(),
        subTitle: identity.GetEntity().GetDisplay(),
        padding: '0px',
        disableClose: true,
        width: calculateSidesheetWidth(1250, 0.7),
        icon: 'contactinfo',
        data: {
          isAdmin: this.isAdmin,
          projectConfig: this.projectConfig,
          selectedIdentity: identity,
          canEdit: this.isPersonAdmin || this.isManagerForPersons,
        },
        testId: 'identities-view-identity-sidesheet',
      })
      .afterClosed()
      .toPromise();
    return this.dataSource.updateState();
  }
}
