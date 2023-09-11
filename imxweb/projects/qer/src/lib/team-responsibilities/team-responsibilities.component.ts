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
 * Copyright 2023 One Identity LLC.
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

import { Component, OnInit } from '@angular/core';
import { TeamResponsibilitiesService } from './team-responsibilities.service';
import { BusyService, ClientPropertyForTableColumns, DataModelWrapper, DataSourceToolbarFilter, DataSourceToolbarSettings, DataSourceWrapper } from 'qbm';
import { PortalRespTeamResponsibilities, ResponsibilitiesExtendedData, ResponsibilityData } from 'imx-api-qer';
import { CollectionLoadParameters, EntitySchema, ValType } from 'imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TeamResponsibilitySidesheetComponent } from './team-responsibility-sidesheet/team-responsibility-sidesheet.component';

@Component({
  selector: 'imx-team-responsibilities',
  templateUrl: './team-responsibilities.component.html',
  styleUrls: ['./team-responsibilities.component.scss'],
})
export class TeamResponsibilitiesComponent implements OnInit {
  public dataModelWrapper: DataModelWrapper;
  public dstWrapper: DataSourceWrapper<PortalRespTeamResponsibilities, ResponsibilitiesExtendedData>;
  public entitySchema: EntitySchema;
  public dstSettings: DataSourceToolbarSettings;
  public busyService = new BusyService();
  public displayColumns: ClientPropertyForTableColumns[];

  constructor(
    private readonly teamResponsibilitiesService: TeamResponsibilitiesService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly translateService: TranslateService
  ) {
    this.entitySchema = this.teamResponsibilitiesService.responsibilitySchema;
  }

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      this.dataModelWrapper = {
        dataModel: await this.teamResponsibilitiesService.getDataModel(),
      };
    } finally {
      isBusy.endBusy();
    }
    this.setDisplayColumns();
    this.dstWrapper = new DataSourceWrapper(
      (state) => this.teamResponsibilitiesService.get(state),
      this.displayColumns,
      this.entitySchema,
      this.dataModelWrapper,
      'team-responsibilites',
    );
    this.getInitialData();
  }

  public async getData(newState?: CollectionLoadParameters): Promise<void> {
    const isbusy = this.busyService.beginBusy();
    try {
      this.dstSettings = await this.dstWrapper.getDstSettings(newState);
    } finally {
      isbusy.endBusy();
    }
  }

  public isResponsibilityOrphaned(responsibility: PortalRespTeamResponsibilities): boolean {
    const extendedData = this.getExtendedData(responsibility);
    return extendedData?.OtherIdentities?.length == 0;
  }
  public isResponsibilityDeletable(responsibility: PortalRespTeamResponsibilities): boolean {
    const extendedData = this.getExtendedData(responsibility);
    return extendedData?.CanDelete;
  }

  public onDeleteResponsibility(responsibility: PortalRespTeamResponsibilities): void {
    console.log(responsibility);
  }

  public onOpenDetails(responsibility: PortalRespTeamResponsibilities): void {
    const extendedData = this.getExtendedData(responsibility);
    this.sideSheet.open(TeamResponsibilitySidesheetComponent, {
      title: this.translateService.instant('#LDS#Heading Other Identities Responsible for the Object'),
      subTitle: responsibility.DisplayName.Column.GetDisplayValue(),
      padding: '0',
      width: 'max(600px, 60%)',
      disableClose: false,
      testId: 'team-responsibilities-sidesheet',
      data: {
        extendedData,
      },
    });
  }

  private getExtendedData(responsibility: PortalRespTeamResponsibilities): ResponsibilityData {
    const index = this.dstSettings.dataSource.Data.indexOf(responsibility);
    return this.dstWrapper.extendedData?.Data[index];
  }

  private async getInitialData(): Promise<void> {
    const filters: DataSourceToolbarFilter[] = this.dataModelWrapper.dataModel.Filters;
    filters.map( filter => {
      if(filter.Name === 'forinactive'){
        filter.InitialValue = '1';
      }
    })
    const isbusy = this.busyService.beginBusy();
    try {
      this.dstSettings = {
        dataSource: {Data: [], totalCount: 0},
        entitySchema: this.entitySchema,
        filters,
        navigationState: {'forinactive': '1'},
        displayedColumns: this.displayColumns
      };
    } finally {
      isbusy.endBusy();
    }
  }

  private setDisplayColumns():void{
    this.displayColumns =
    [
      this.entitySchema.Columns.DisplayName,
      {
        ColumnName: 'badges',
        Type: ValType.String,
      },
      this.entitySchema.Columns.UID_Person,
      // TODO Work item: #426008
      // {
      //   ColumnName: 'actions',
      //   Type: ValType.String,
      // },
    ];
  }
}
