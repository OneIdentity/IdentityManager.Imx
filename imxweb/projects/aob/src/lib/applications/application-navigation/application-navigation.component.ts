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
 * Copyright 2022 One Identity LLC.
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

import { Component, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { EuiLoadingService } from '@elemental-ui/core';

import { PortalApplication, PortalApplicationNew } from 'imx-api-aob';
import { CollectionLoadParameters, FilterType, CompareOperator, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { ClassloggerService, DataSourceToolbarSettings, DataTileBadge, DataTilesComponent, SettingsService } from 'qbm';
import { ApplicationsService } from '../applications.service';
import { UserModelService } from 'qer';

/**
 * This component shows a  list of {@link PortalApplication[]|applications} each in an
 * {@link ApplicationCardComponent|ApplicationCardComponent}.
 */
@Component({
  selector: 'imx-application-navigation',
  templateUrl: './application-navigation.component.html',
  styleUrls: ['./application-navigation.component.scss']
})
export class ApplicationNavigationComponent implements OnInit {
  public dstSettings: DataSourceToolbarSettings;
  public readonly entitySchema = PortalApplication.GetEntitySchema();
  public selectable = true;
  public multiselect = false;
  public hideCustomToolbar = true;
  public filterKpiChecked = false;
  public isAdmin = false;

  @Output() public readonly dataSourceChanged =
    new EventEmitter<{ keywords?: string; dataSource: TypedEntityCollectionData<PortalApplication> }>();
  @Output() public readonly applicationSelected = new EventEmitter<string>();

  public readonly status = {
    getBadges: (application: PortalApplication | PortalApplicationNew): DataTileBadge[] => this.appService.getApplicationBadges(application)
  };

  private navigationState: CollectionLoadParameters & {
    filterkpi?: boolean
  };

  @ViewChild('tiles', { static: true }) private readonly tiles: DataTilesComponent;

  constructor(
    private logger: ClassloggerService,
    private readonly appService: ApplicationsService,
    private readonly busyService: EuiLoadingService,
    private readonly settingsService: SettingsService,
    private readonly userService: UserModelService,
    private readonly applicationsProvider: ApplicationsService,
    public overlay: Overlay) {
  }

  public async ngOnInit(): Promise<void> {
    this.isAdmin = (await this.userService.getGroups()).some(ug => ug.Name === 'AOB_4_AOB_Admin');

    this.applicationsProvider.applicationRefresh.subscribe((res) => {
      if(res){ 
        return this.getData();
      }
    })
    return this.getData({ PageSize: this.settingsService.DefaultPageSize, StartIndex: 0 });
  }

  public async onSelectionChanged(selection: PortalApplication[]): Promise<void> {
    const app = selection[0];
    if (app) {
      this.applicationSelected.emit(app.UID_AOBApplication.value);
    }
  }

  public async getData(newState?: CollectionLoadParameters, keywords?: string): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }

    const overlayRef = this.busyService.show();
    try {
      const dataSource = await this.appService.get(this.navigationState);

      if (dataSource) {
        this.dstSettings = {
          dataSource,
          entitySchema: this.entitySchema,
          navigationState: this.navigationState
        };
      } else {
        this.dstSettings = undefined;
        this.logger.error(this, 'TypedEntityCollectionData<PortalApplication> is undefined');
      }

      this.dataSourceChanged.emit({ keywords, dataSource });
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public clearSelection(): void {
    this.tiles?.clearSelection();
  }

  public onCreateNew(): void {
    this.clearSelection();
    this.appService.createApplication();
  }

  public async onSearch(keywords: string): Promise<void> {
    this.logger.debug(this, `Searching for: ${keywords}`);

    this.navigationState.StartIndex = 0;
    if (keywords == null || keywords.length === 0) {
      this.navigationState.search = null;
    } else {
      this.navigationState.search = keywords;
    }

    return this.getData(undefined, keywords);
  }

  public async filterApplicationsWithKpiIssues(): Promise<void> {
    this.navigationState.filterkpi = this.filterKpiChecked;
    this.navigationState.StartIndex = 0;
    await this.getData();
  }

}
