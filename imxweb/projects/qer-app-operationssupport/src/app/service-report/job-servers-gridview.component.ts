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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { OpsupportJobservers, ServerExtendedData } from 'imx-api-qbm';
import { JobServersParameters, JobServersService } from './job-servers.service';
import { DataSourceToolbarSettings, SettingsService, SnackBarService } from 'qbm';
import { JobServersEditComponent } from './job-servers-edit/job-servers-edit.component';
import { JobServersDetailsComponent } from './job-servers-details/job-servers-details.component';
@Component({
  selector: 'imx-job-servers-gridview',
  templateUrl: './job-servers-gridview.component.html',
  styleUrls: ['./job-servers-gridview.component.scss'],
})
export class JobServersGridviewComponent implements OnInit {
  public dstSettings: DataSourceToolbarSettings;

  @Input() public withRefresh = false;

  @Output() public readonly jobServersChecked = new EventEmitter<boolean>();

  private navigationState: JobServersParameters;
  private editableFields: string[] | undefined;

  constructor(
    private gridDataService: JobServersService,
    private busyService: EuiLoadingService,
    private readonly settingsService: SettingsService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly snackBarService: SnackBarService,
    private readonly translateService: TranslateService
  ) {}

  public async ngOnInit(): Promise<void> {
    let overlayRef = this.busyService.show();
    try {
      await this.refresh();
      this.editableFields = (await this.gridDataService.getProjectConfig()).EditableFields.QBMServer;
    } finally {
      this.busyService.hide(overlayRef);
    }
  }

  public onSearch(keywords: string): Promise<void> {
    return this.getData({ PageSize: this.settingsService.DefaultPageSize, StartIndex: 0, search: keywords });
  }

  public navigationStateChanged(navigationState: JobServersParameters): Promise<void> {
    return this.getData({ ...this.navigationState, ...navigationState });
  }

  public async refresh(withconnection: boolean = false): Promise<void> {
    await this.getData({ PageSize: this.settingsService.DefaultPageSize, StartIndex: 0, withconnection });
  }

  private async getData(navigationState: JobServersParameters): Promise<void> {
    this.navigationState = { ...this.navigationState, ...navigationState };

    let data = await this.gridDataService.get(this.navigationState);
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
    const displayedColumns = [];
    displayedColumns.push(entitySchema.Columns.Ident_Server);
    if (this.navigationState.withconnection) {
      displayedColumns.push(entitySchema.Columns.Connection);
    }
    displayedColumns.push(entitySchema.Columns.LastJobFetchTime);
    displayedColumns.push(entitySchema.Columns.ServerWebUrl);
    displayedColumns.push(entitySchema.Columns.PhysicalServerName);
    displayedColumns.push(entitySchema.Columns.IPV4);
    //Additional Columns added
    displayedColumns.push(entitySchema.Columns.Warning);
    displayedColumns.push(entitySchema.Columns.Details);
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));
    try {
      this.dstSettings = {
        displayedColumns,
        dataSource: data,
        entitySchema,
        navigationState: this.navigationState,
        extendedData: data.extendedData[0],
      };

      this.jobServersChecked.emit(this.navigationState.withconnection);
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }
  public async checkServer(data: any, event: Event) {
    event.stopPropagation();
    let overlayRef = this.busyService.show();
    let uid = data.GetEntity().GetKeys()[0],
      connectionTime;
    connectionTime = await this.gridDataService.checkServerConnection(uid);
    this.busyService.hide(overlayRef);
    if (connectionTime.Value === -1) {
      let textContainer = { key: '#LDS#The server does not respond.' };
      this.snackBarService.open(textContainer, '#LDS#Close', { duration: 6000 });
    } else {
      data.GetEntity().Commit(true);
      this.refresh(true);
    }
  }

  public getDateDifference(date: Date) {
    let currentTime: any = new Date().getTime(),
      lastJobFetchTime: any = new Date(date).getTime(),
      diff = (currentTime - lastJobFetchTime) / (60 * 1000); // converting to sec
    return diff > 10;
  }

  public edit(data: OpsupportJobservers): void {
    this.sidesheet.open(JobServersEditComponent, {
      title: this.translateService.instant('#LDS#Heading Edit Server Settings'),
      disableClose: true,
      padding: '0',
      width: 'max(50%,500px)',
      testId: 'job-servers-edit-sidesheet',
      data: { data, properties: this.editableFields },
    });
  }

  public getServerDetails(data: ServerExtendedData[], event: Event): void {
    event.stopPropagation();
    let overlayRef = this.busyService.show();
    try {
      this.sidesheet.open(JobServersDetailsComponent, {
        title: this.translateService.instant('#LDS#Heading View Server Details'),
        width: 'max(50%,500px)',
        padding: '0',
        testId: 'job-servers-deatils-sidesheet',
        data: data,
      });
    } finally {
      this.busyService.hide(overlayRef);
    }
  }
}
