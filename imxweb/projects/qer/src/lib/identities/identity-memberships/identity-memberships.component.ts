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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, Input, OnInit } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';

import { CollectionLoadParameters, DisplayColumns } from 'imx-qbm-dbts';
import { DataSourceToolbarSettings, SettingsService } from 'qbm';
import { IdentityMembershipsParameters } from './identity-memberships-parameters.interface';

@Component({
  selector: 'imx-identity-memberships',
  templateUrl: './identity-memberships.component.html',
  styleUrls: ['./identity-memberships.component.scss']
})
export class IdentityMembershipsComponent implements OnInit {

  public dstSettings: DataSourceToolbarSettings;
  public readonly DisplayColumns = DisplayColumns;

  @Input() public membershipParameters: IdentityMembershipsParameters;

  private navigationState: CollectionLoadParameters;

  constructor(
    private readonly busyService: EuiLoadingService,
    private readonly settingService: SettingsService) {

    this.navigationState = { PageSize: this.settingService.DefaultPageSize };
  }

  public async ngOnInit(): Promise<void> {
    return this.getData();
  }

  public async onNavigationStateChanged(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }
    await this.getData();
  }

  public async onSearch(keywords: string): Promise<void> {
    this.navigationState.StartIndex = 0;
    this.navigationState.search = keywords;
    await this.getData();
  }

  private async getData(): Promise<void> {

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      const groupsPerIdentity = await this.membershipParameters.getData(this.navigationState);
      this.dstSettings = {
        displayedColumns: this.membershipParameters.displayedColumns,
        dataSource: groupsPerIdentity,
        entitySchema: this.membershipParameters.entitySchema,
        navigationState: this.navigationState
      };
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }


}
