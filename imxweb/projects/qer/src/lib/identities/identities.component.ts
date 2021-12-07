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
 * Copyright 2021 One Identity LLC.
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

import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { EuiSidesheetService, EuiLoadingService } from '@elemental-ui/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import {
  ClassloggerService,
  DataSourceToolbarSettings,
  ImxTranslationProviderService,
  DataSourceToolbarFilter,
  DataSourceToolbarGroupData,
  DataTableGroupedData,
  SettingsService
} from 'qbm';
import { CollectionLoadParameters, IClientProperty, DisplayColumns, DataModelProperty, EntitySchema } from 'imx-qbm-dbts';
import { IdentitiesService } from './identities.service';
import {
  PortalAdminPerson,
  PortalPersonReports,
  PortalPersonReportsInteractive,
  PortalPersonAll,
  ProjectConfig,
} from 'imx-api-qer';
import { ProjectConfigurationService } from '../project-configuration/project-configuration.service';
import { IdentitySidesheetComponent } from './identity-sidesheet/identity-sidesheet.component';
import { TranslateService } from '@ngx-translate/core';
import { IDataExplorerComponent } from '../data-explorer-view/data-explorer-extension';

@Component({
  selector: 'imx-data-explorer-identities',
  templateUrl: './identities.component.html',
  styleUrls: ['./identities.component.scss'],
})
export class DataExplorerIdentitiesComponent implements OnInit, OnDestroy, IDataExplorerComponent {
  @Input() public applyIssuesFilter = false;

  /**
   * If set to false the css class for the fullscreen view will be deactivated
   */
  @Input() public showFullscreen = true;

  /**
   * Sets the admin mode to show all identities
   */
  @Input() public isAdmin = false;

  /**
   * Settings needed by the DataSourceToolbarComponent
   */
  public dstSettings: DataSourceToolbarSettings;

  /**
   * Page size, start index, search and filtering options etc.
   */
  public navigationState: CollectionLoadParameters;

  /**
   * Selected person
   */
  public selectedPerson: PortalPersonAll | PortalPersonReports;

  /**
   * Details of selected person
   */
  public selectedPersonDetail: PortalAdminPerson | PortalPersonReports;

  public readonly entitySchemaPersonReports: EntitySchema;
  public readonly entitySchemaPerson: EntitySchema;
  public readonly entitySchemaAdminPerson: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;
  public filterOptions: DataSourceToolbarFilter[] = [];
  public groupingOptions: DataModelProperty[] = [];
  public data: any;

  public groupData: { [key: string]: DataTableGroupedData } = {};

  private projectConfig: ProjectConfig;
  private displayedColumns: IClientProperty[] = [];
  private authorityDataDeleted$: Subscription;

  private displayedInnerColumns: IClientProperty[] = [];
  private groupingInfo: DataSourceToolbarGroupData;

  constructor(
    public translateProvider: ImxTranslationProviderService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly busyService: EuiLoadingService,
    private readonly logger: ClassloggerService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly configService: ProjectConfigurationService,
    private readonly identitiesService: IdentitiesService,
    private readonly translate: TranslateService,
    settingsService: SettingsService,
  ) {
    this.navigationState = { PageSize: settingsService.DefaultPageSize, StartIndex: 0 };
    this.entitySchemaPersonReports = identitiesService.personReportsSchema;
    this.entitySchemaPerson = identitiesService.personSchema;
    this.entitySchemaAdminPerson = identitiesService.adminPersonSchema;
    this.authorityDataDeleted$ = this.identitiesService.authorityDataDeleted.subscribe(() => this.navigate());
  }

  get isMobile(): boolean {
    return document.body.offsetWidth <= 768;
  }

  public async ngOnInit(): Promise<void> {

    const isAdminOldValue = this.isAdmin;
    this.isAdmin = this.activatedRoute.snapshot.url[0].path === 'admin';

    if (isAdminOldValue !== this.isAdmin) {
      await this.init();
    }

    await this.init();
  }

  public ngOnDestroy(): void {
    if (this.authorityDataDeleted$) {
      this.authorityDataDeleted$.unsubscribe();
    }
  }

  /**
   * Occurs when the navigation state has changed - e.g. users clicks on the next page button.
   *
   */
  public async onNavigationStateChanged(newState: CollectionLoadParameters): Promise<void> {
    this.navigationState = newState;
    await this.navigate();
  }

  /**
   * Occurs when user selects an identity.
   *
   * @param identity Selected identity.
   */
  public async onIdentityChanged(identity: PortalPersonAll | PortalPersonReports): Promise<void> {
    const overlayRef = this.busyService.show();

    try {
      this.logger.debug(this, `Selected identity changed`);
      this.logger.trace('New selected identity', identity);
      this.selectedPerson = identity;
      this.selectedPersonDetail = await this.getPersonDetails(this.selectedPerson.GetEntity().GetKeys()[0]);
      await this.viewIdentity(this.selectedPersonDetail);
    } finally {
      this.busyService.hide(overlayRef);
    }
  }

  /**
   * Occurs when user triggers search.
   *
   * @param keywords Search keywords.
   */
  public async onSearch(keywords: string): Promise<void> {
    this.logger.debug(this, `Searching for: ${keywords}`);
    this.navigationState.StartIndex = 0;
    this.navigationState.search = keywords;
    await this.navigate();
  }

  public async onGroupingChange(groupKey: string): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));

    try {
      const groupData = this.groupData[groupKey];
      groupData.data = this.isAdmin
        ? await this.identitiesService.getAllPersonAdmin(groupData.navigationState)
        : await this.identitiesService.getDirectReportsOfManager(groupData.navigationState);
      groupData.settings = {
        displayedColumns: this.displayedInnerColumns,
        dataSource: groupData.data,
        entitySchema: this.entitySchemaPersonReports,
        navigationState: groupData.navigationState,
      };
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  private async init(): Promise<void> {
    this.projectConfig = await this.configService.getConfig();
    this.displayedColumns = [
      this.entitySchemaPersonReports.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchemaPersonReports.Columns.IsSecurityIncident,
      this.entitySchemaPersonReports.Columns.UID_Department,
    ];

    if (!this.isAdmin) {
      this.displayedColumns.push(
        this.entitySchemaPersonReports.Columns.IdentityType,
        this.entitySchemaPersonReports.Columns.EmployeeType,
        this.entitySchemaPersonReports.Columns.IsExternal
      );
    }

    // Ensure this column is always added last
    this.displayedColumns.push(this.entitySchemaPersonReports.Columns.XMarkedForDeletion);

    this.displayedInnerColumns = [
      this.entitySchemaPersonReports.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
    ];

    const identityDataModel = this.isAdmin
      ? await this.identitiesService.getDataModelAdmin()
      : await this.identitiesService.getDataModelReport();
    this.filterOptions = identityDataModel.Filters;
    this.groupingOptions = this.getGroupableProperties(identityDataModel.Properties);

    if (!this.isAdmin) {
      const indexActive = this.filterOptions.findIndex(elem => elem.Name === 'isinactive');
      if (indexActive > -1) {
        this.filterOptions[indexActive].InitialValue = '0';
      }
      const reports = this.filterOptions.findIndex(elem => elem.Name === 'reports');
      if (reports > -1) {
        this.filterOptions[reports].InitialValue = '0';
      }
    }

    if (this.applyIssuesFilter) {
      const ownerFilter = this.filterOptions.find((f) => {
        return f.Name === 'withmanager';
      });

      ownerFilter.InitialValue = '0';
    }
    await this.navigate();
  }

  private async navigate(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));

    try {
      this.logger.debug(this, `Retrieving person list`);
      this.logger.trace('Navigation settings', this.navigationState);
      if (!this.groupingInfo && this.groupingOptions.length > 0) {
        this.groupingInfo = {
          groups: [{
            property: this.groupingOptions[0],
            getData: async () => (await this.identitiesService.getGroupedAllPerson(
              'IdentityType',
              { PageSize: this.navigationState.PageSize, StartIndex: 0 }
            )).filter(item => item.Count > 0)
          }]
        };
      }

      const data = this.isAdmin
        ? await this.identitiesService.getAllPersonAdmin(this.navigationState)
        : await this.identitiesService.getDirectReportsOfManager(this.navigationState);
      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: data,
        entitySchema: this.entitySchemaPersonReports,
        navigationState: this.navigationState,
        filters: this.filterOptions,
        groupData: this.groupingInfo
      };
      this.logger.debug(this, `Head at ${data.Data.length + this.navigationState.StartIndex} of ${data.totalCount} item(s)`);
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  private async getPersonDetails(id: string): Promise<PortalAdminPerson | PortalPersonReportsInteractive> {
    if (id == null || id.length <= 0) {
      return null;
    }
    this.logger.debug(this, `Retrieving details for admin person with id ${id}`);

    return this.isAdmin
      ? this.identitiesService.getAdminPerson(id)
      : (await this.identitiesService.getPersonInteractive(id)).Data[0];
  }

  private async viewIdentity(identity: PortalAdminPerson | PortalPersonReportsInteractive): Promise<void> {
    await this.sideSheet.open(IdentitySidesheetComponent, {
      title: await this.translate.get('#LDS#Heading View Identity Details').toPromise(),
      headerColour: 'blue',
      padding: '0px',
      width: 'max(700px, 60%)',
      icon: 'contactinfo',
      data: {
        isAdmin: this.isAdmin,
        projectConfig: this.projectConfig,
        selectedIdentity: identity,
      }
    }).afterClosed().toPromise();
    return this.navigate();
  }

  private getGroupableProperties(identityProperties: DataModelProperty[]): DataModelProperty[] {
    let groupable: DataModelProperty[] = [];
    groupable = identityProperties.filter(item => item.IsGroupable);
    return groupable;
  }
}
