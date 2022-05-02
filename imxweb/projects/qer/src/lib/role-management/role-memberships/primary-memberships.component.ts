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

import { Component, Input, OnInit } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';
import { OwnershipInformation } from 'imx-api-qer';
import { CollectionLoadParameters, DisplayColumns, IClientProperty, IEntity } from 'imx-qbm-dbts';
import { DataSourceToolbarFilter, DataSourceToolbarSettings } from 'qbm';
import { RoleService } from '../role.service';

@Component({
  selector: 'imx-primary-memberships',
  templateUrl: './primary-memberships.component.html',
  styleUrls: ['./primary-memberships.component.scss', '../sidesheet.scss', './role-sidesheet-tabs.scss'],
})
export class PrimaryMembershipsComponent implements OnInit {
  public dstSettings: DataSourceToolbarSettings;
  public navigationState: CollectionLoadParameters = {};
  public DisplayColumns = DisplayColumns;
  public displayColumns: IClientProperty[] = [];
  public filterOptions: DataSourceToolbarFilter[] = [];

  @Input() public entity: IEntity;
  @Input() public isAdmin: boolean;
  @Input() public ownershipInfo: OwnershipInformation;

  constructor(
    private membershipService: RoleService,
    private readonly busyService: EuiLoadingService
  ) {
  }

  public async ngOnInit(): Promise<void> {
    await this.navigate();
  }

  public async onSearch(keywords: string): Promise<void> {
    this.navigationState.StartIndex = 0;
    this.navigationState.search = keywords;
    await this.navigate();
  }

  public async onNavigationStateChanged(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }
    await this.navigate();
  }

  private async navigate(): Promise<void> {
    this.busyService.show();
    const entitySchema = this.membershipService.getPrimaryMembershipSchema(this.ownershipInfo.TableName);
    this.displayColumns = [
      entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      entitySchema.Columns.PrimaryMemberSince];

    try {
      this.dstSettings = {
        dataSource: await this.membershipService.getPrimaryMemberships(this.ownershipInfo.TableName, this.entity.GetKeys()[0], this.navigationState),
        entitySchema,
        navigationState: this.navigationState,
        displayedColumns: this.displayColumns,
      };
    } finally {
      this.busyService.hide();
    }
  }
}
