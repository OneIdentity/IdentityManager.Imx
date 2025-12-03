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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { OpsupportJobservers } from '@imx-modules/imx-api-qbm';
import {
  CollectionLoadParameters,
  EntitySchema,
  ExtendedTypedEntityCollection,
  IClientProperty,
  TypedEntity,
} from '@imx-modules/imx-qbm-dbts';
import {
  calculateSidesheetWidth,
  DataSourceToolbarSettings,
  DataViewInitParameters,
  DataViewSource,
  SettingsService,
  SnackBarService,
} from 'qbm';
import { JobServersDetailsComponent } from './job-servers-details/job-servers-details.component';
import { JobServersEditComponent } from './job-servers-edit/job-servers-edit.component';
import { JobServersParameters, JobServersService } from './job-servers.service';

@Component({
  selector: 'imx-job-servers-gridview',
  templateUrl: './job-servers-gridview.component.html',
  styleUrls: ['./job-servers-gridview.component.scss'],
  standalone: false,
  providers: [DataViewSource],
})
export class JobServersGridviewComponent implements OnInit {
  public dstSettings: DataSourceToolbarSettings;

  @Input() public withRefresh = false;

  @Output() public readonly jobServersChecked = new EventEmitter<boolean>();

  public navigationState: JobServersParameters;
  private editableFields: string[] | undefined;

  public entitySchema: EntitySchema;

  constructor(
    private gridDataService: JobServersService,
    private busyService: EuiLoadingService,
    private readonly settingsService: SettingsService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly snackBarService: SnackBarService,
    private readonly translateService: TranslateService,
    public dataSource: DataViewSource,
  ) {
    let entitySchema = this.gridDataService.OpsupportJobserversSchema;
    let extraColumns = {
      CheckServer: {
        ColumnName: 'CheckServer',
        IsReadOnly: true,
      },
      Warning: {
        ColumnName: 'Warning',
        IsReadOnly: true,
      },
      Details: {
        ColumnName: 'Details',
        IsReadOnly: true,
      },
    };
    Object.assign(entitySchema.Columns, extraColumns);
    this.entitySchema = entitySchema;
  }

  public async ngOnInit(): Promise<void> {
    try {
      await this.refresh();
      this.editableFields = (await this.gridDataService.getProjectConfig()).EditableFields?.QBMServer;
    } finally {
    }
  }

  public async refresh(withconnection: boolean = false): Promise<void> {
    await this.getData({ PageSize: this.settingsService.DefaultPageSize, StartIndex: 0, withconnection });
  }

  private async getDataInternal() {
    let displayedColumns: IClientProperty[] = [];
    displayedColumns.push(this.entitySchema?.Columns.Ident_Server);
    if (this.navigationState.withconnection) {
      displayedColumns.push(this.entitySchema.Columns.Connection);
    }
    displayedColumns.push(this.entitySchema.Columns.LastJobFetchTime);
    displayedColumns.push(this.entitySchema.Columns.ServerWebUrl);
    displayedColumns.push(this.entitySchema.Columns.PhysicalServerName);
    displayedColumns.push(this.entitySchema.Columns.IPV4);
    //Additional Columns added
    displayedColumns.push(this.entitySchema.Columns.Warning);
    displayedColumns.push(this.entitySchema.Columns.Details);

    const dataSourceParameter: DataViewInitParameters<TypedEntity> = {
      execute: async (params: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<OpsupportJobservers, unknown>> => {
        return this.gridDataService.get(params);
      },
      highlightEntity: (entity: TypedEntity) => {
        this.edit(entity);
      },
      schema: this.entitySchema,
      columnsToDisplay: displayedColumns,
    };
    await this.dataSource.init(dataSourceParameter);
  }

  private async getData(navigationState: JobServersParameters): Promise<void> {
    this.navigationState = { ...this.navigationState, ...navigationState };

    await this.getDataInternal();
    this.dataSource.state.set(this.navigationState);
    this.dataSource.updateState();
    this.jobServersChecked.emit(this.navigationState.withconnection);
  }

  public async checkServer(data: TypedEntity, event: Event) {
    event.stopPropagation();
    let uid = data.GetEntity().GetKeys()[0],
      connectionTime;
    try {
      connectionTime = await this.gridDataService.checkServerConnection(uid);
    } finally {
    }
    if (connectionTime.Value === -1) {
      let textContainer = { key: '#LDS#The job server does not respond.' };
      this.snackBarService.open(textContainer, '#LDS#Close', { duration: 6000 });
    } else {
      let committed = false;
      try {
        await data.GetEntity().Commit(true);
        committed = true;
      } finally {
        if (committed) {
          this.refresh(true);
        }
      }
    }
  }

  public getDateDifference(date: Date) {
    let currentTime: any = new Date().getTime(),
      lastJobFetchTime: any = new Date(date).getTime(),
      diff = (currentTime - lastJobFetchTime) / (60 * 1000); // converting to sec
    return diff > 10;
  }

  public edit(data: TypedEntity): void {
    this.sidesheet.open(JobServersEditComponent, {
      title: this.translateService.instant('#LDS#Heading Edit Job Server Settings'),
      subTitle: data.GetEntity().GetDisplay(),
      disableClose: true,
      padding: '0',
      width: calculateSidesheetWidth(800, 0.5),
      testId: 'job-servers-edit-sidesheet',
      data: { data, properties: this.editableFields },
    });
  }

  public getServerDetails(data: OpsupportJobservers, event: Event): void {
    event.stopPropagation();
    let overlayRef = this.busyService.show();
    try {
      this.sidesheet.open(JobServersDetailsComponent, {
        title: this.translateService.instant('#LDS#Heading View Job Server Details'),
        subTitle: data.GetEntity().GetDisplay(),
        width: calculateSidesheetWidth(800, 0.5),
        padding: '0',
        testId: 'job-servers-details-sidesheet',
        data: this.dstSettings.extendedData,
      });
    } finally {
      this.busyService.hide(overlayRef);
    }
  }
}
