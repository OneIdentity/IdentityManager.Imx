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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';
import { CollectionLoadParameters, EntitySchema, IClientProperty } from 'imx-qbm-dbts';
import { DataSourceToolbarSettings, SettingsService } from 'qbm';
import { WebApplicationsService } from './web-applications.service';

@Component({
  selector: 'imx-web-applications',
  templateUrl: './web-applications.component.html',
  styleUrls: ['./web-applications.component.scss'],
})
export class WebApplicationsComponent implements OnInit {

  public dstSettings: DataSourceToolbarSettings;
  public readonly entitySchemaWebApplications: EntitySchema;
  private navigationState: CollectionLoadParameters;
  private readonly displayedColumns: IClientProperty[];


  constructor(
    private webApplicationsService: WebApplicationsService,
    private busyService: EuiLoadingService,
    private readonly settings: SettingsService
  ) {
    this.entitySchemaWebApplications = webApplicationsService.schema;
    this.displayedColumns = [
      this.entitySchemaWebApplications.Columns.BaseURL,
      this.entitySchemaWebApplications.Columns.UID_DialogProduct,
      this.entitySchemaWebApplications.Columns.IsDebug,
      this.entitySchemaWebApplications.Columns.IsPrivate,
      this.entitySchemaWebApplications.Columns.AutoUpdateLevel,
    ];
  }

  public async ngOnInit(): Promise<void> {
    this.getData({ StartIndex: 0, PageSize: this.settings.DefaultPageSize });
  }

  public onSearch(keywords: string): Promise<void> {
    return this.getData({ StartIndex: 0, search: keywords });
  }

  public async refresh(): Promise<void> {
    this.getData(this.navigationState);
  }

  public async getData(navigationState: CollectionLoadParameters): Promise<void> {
    this.navigationState = navigationState;

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {

      const applications = await this.webApplicationsService.get(navigationState);
      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: applications,
        entitySchema: this.entitySchemaWebApplications,
        navigationState: this.navigationState
      };

    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }
}
