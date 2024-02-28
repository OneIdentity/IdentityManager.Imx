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

import { Component, Input, OnInit } from '@angular/core';

import { CollectionLoadParameters, DisplayColumns, EntitySchema, IClientProperty } from 'imx-qbm-dbts';
import { DataSourceToolbarSettings, DynamicTabDataProviderDirective, SettingsService, BusyService } from 'qbm';
import { AccountsExtService } from './account-ext.service';

@Component({
  templateUrl: './accounts-ext.component.html',
  styleUrls: ['../accounts.component.scss', './accounts-ext.component.scss'],
})
export class AccountsExtComponent implements OnInit {
  @Input() public referrer: {
    objecttable?: string;
    objectuid?: string;
    tablename?: string;
  };

  public dstSettings: DataSourceToolbarSettings;
  public readonly DisplayColumns = DisplayColumns;

  public entitySchemaAccount: EntitySchema;
  public busyService = new BusyService();

  private displayColumns: IClientProperty[] = [];
  private navigationState: CollectionLoadParameters;

  constructor(
    private readonly settingService: SettingsService,
    private readonly accountsService: AccountsExtService,
    dataProvider: DynamicTabDataProviderDirective
  ) {
    this.referrer = dataProvider?.data;
    this.navigationState = { PageSize: this.settingService.DefaultPageSize };
    this.entitySchemaAccount = accountsService.portalPersonAccountsSchema;
    /** if you like to add columns, please check {@link DataExplorerAccountsComponent | Accounts Component} as well */
    this.displayColumns = [
      this.entitySchemaAccount.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchemaAccount.Columns.UID_UNSRoot,
      this.entitySchemaAccount.Columns.AccountDisabled,
      this.entitySchemaAccount.Columns.XMarkedForDeletion,
    ];
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
    const isBusy = this.busyService.beginBusy();
    try {
      const groupsPerIdentity = await this.accountsService.getAccounts(this.referrer.objectuid, this.navigationState);
      this.dstSettings = {
        displayedColumns: this.displayColumns,
        dataSource: groupsPerIdentity,
        entitySchema: this.entitySchemaAccount,
        navigationState: this.navigationState,
      };
    } finally {
      isBusy.endBusy();
    }
  }
}
