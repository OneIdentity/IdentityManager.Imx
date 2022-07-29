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

import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PortalRolesEntitlements } from 'imx-api-qer';
import { CollectionLoadParameters, DbObjectKey, DisplayColumns, EntitySchema, IClientProperty } from 'imx-qbm-dbts';
import {
  DataSourceToolbarSettings,
  DataSourceToolbarFilter,
  ClassloggerService,
  DataTableComponent,
  StorageService,
  HELPER_ALERT_KEY_PREFIX,
  SettingsService,
  MetadataService,
  DynamicMethodService
} from 'qbm';
import { QerApiService } from '../../qer-api-client.service';
import { RequestsEntitySelectorComponent } from '../requests-selector/requests-entity-selector.component';
import { ACTION_DISMISS, RequestsService } from '../requests.service';

export interface EntitlementCountUpdateData {
  count: number;
  recentDeleteAction: boolean;
}

const helperAlertKey = `${HELPER_ALERT_KEY_PREFIX}_requestShopShelfEntitlements`;

@Component({
  selector: 'imx-request-shelf-entitlements',
  templateUrl: './request-shelf-entitlements.component.html',
  styleUrls: ['../request-config-common.scss']
})
export class RequestShelfEntitlementsComponent implements OnInit {

  @Input() public shelfId: string;
  @Output() public entitlementCountUpdated = new EventEmitter<EntitlementCountUpdateData>();
  @ViewChild('dataTable', { static: false }) public dataTable: DataTableComponent<PortalRolesEntitlements>;

  public dstSettings: DataSourceToolbarSettings;
  public navigationState: CollectionLoadParameters;
  public filterOptions: DataSourceToolbarFilter[] = [];
  public selectedEntitlements: PortalRolesEntitlements[] = [];

  private displayedColumns: IClientProperty[];

  public DisplayColumns = DisplayColumns;

  public entitySchema: EntitySchema;

  public entitlementTypes: Map<string, string> = new Map();

  constructor(
    private readonly logger: ClassloggerService,
    public readonly requestsService: RequestsService,
    private readonly qerApiService: QerApiService,
    private readonly storageService: StorageService,
    private readonly settingsService: SettingsService,
    private readonly metadata: MetadataService,
    private readonly matDialog: MatDialog,
    private readonly dynamicMethodService: DynamicMethodService,
  ) {
    this.navigationState = { PageSize: this.settingsService.DefaultPageSize, StartIndex: 0 };
    this.entitySchema = qerApiService.typedClient.PortalRolesEntitlements.GetSchema();
    this.displayedColumns = [
      this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchema.Columns.XOrigin,
      this.entitySchema.Columns.XDateInserted
    ];

  }

  get isMobile(): boolean {
    return document.body.offsetWidth <= 768;
  }

  get showHelperAlert(): boolean {
    return !this.storageService.isHelperAlertDismissed(helperAlertKey);
  }

  public async ngOnInit(): Promise<void> {
    await this.navigate();
  }

  public async onSearch(keywords: string): Promise<void> {
    this.logger.debug(this, `Searching for: ${keywords}`);
    this.navigationState.StartIndex = 0;
    this.navigationState.search = keywords;
    await this.navigate();
  }

  public onEntitlementSelected(selected: PortalRolesEntitlements[]): void {
    this.logger.debug(this, `Selected entitlements changed`);
    this.logger.trace(`New entitlement selections`, selected);
    this.selectedEntitlements = selected;
  }

  /**
   * Occurs when the navigation state has changed - e.g. users clicks on the next page button.
   *
   */
  public async onNavigationStateChanged(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }
    await this.navigate();
  }

  public openEntitlementSelector(): void {
    const dialogRef = this.matDialog.open(RequestsEntitySelectorComponent, {
      width: this.isMobile ? '90vw' : '60vw',
      maxWidth: this.isMobile ? '90vw' : '80vw',
      minHeight: '60vh',
      data: {
        shelfId: this.shelfId
      }
    });
    dialogRef.afterClosed().subscribe((selectedValues: string[]) => {
      if (selectedValues) {
        this.processEntitlementSelections(selectedValues);
      }
    });
  }

  public async removeEntitlements(): Promise<void> {
    this.requestsService.handleOpenLoader();
    try {
      const promises = [];
      // TODO what if only some succeed?
      this.selectedEntitlements.forEach((ent) => {
        const entitlementKey = DbObjectKey.FromXml(ent.ObjectKeyElement.value);
        promises.push(this.dynamicMethodService.delete(this.qerApiService.apiClient,
          '/portal/shop/config/entitlements/'
          + this.shelfId + '/'
          + entitlementKey.TableName + '/'
          + entitlementKey.Keys[0],
          {}));
      });
      await Promise.all(promises);

      await this.navigate(true);
      // Reset table selections (removing references to now deleted members)
      this.dataTable.clearSelection();
      this.requestsService.openSnackbar('#LDS#The products have been successfully removed.', ACTION_DISMISS);
    } finally {
      this.requestsService.handleCloseLoader();
    }
  }

  public onHelperDismissed(): void {
    this.storageService.storeHelperAlertDismissal(helperAlertKey);
  }

  private async processEntitlementSelections(values: string[]): Promise<void> {
    this.requestsService.handleOpenLoader();
    try {
      await this.requestsService.selectedEntitlementType.addEntitlementSelections(this.shelfId, values);
      this.requestsService.openSnackbar('#LDS#The products have been successfully added.', ACTION_DISMISS);
      await this.navigate();
    } finally {
      this.requestsService.handleCloseLoader();
    }
  }

  private async navigate(recentDeleteAction: boolean = false): Promise<void> {
    this.requestsService.handleOpenLoader();
    const getParams: any = this.navigationState;

    try {
      const data = await this.qerApiService.typedClient.PortalRolesEntitlements.Get("ITShopOrg", this.shelfId, getParams);
      // Notify caller of new count, but only when a search is not applied, and indicate if an
      // entitlement was recently deleted
      if (!this.navigationState?.search || this.navigationState?.search === '') {
        const countUpdateData: EntitlementCountUpdateData = {
          count: data.totalCount,
          recentDeleteAction
        };
        this.entitlementCountUpdated.emit(countUpdateData);
      }
      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: data,
        entitySchema: this.entitySchema,
        navigationState: this.navigationState,
        filters: this.filterOptions,
      };
      this.logger.debug(this, `Head at ${data.Data.length + this.navigationState.StartIndex} of ${data.totalCount} item(s)`);

      data.Data.forEach(async (item: PortalRolesEntitlements) => {
        const objKey = DbObjectKey.FromXml(item.ObjectKeyElement.value);
        var uid = item.GetEntity().GetKeys().toString();
        var display: string;
        if (!this.entitlementTypes.has(objKey.TableName)) {
          const metadata = await this.metadata.GetTableMetadata(objKey.TableName);
          this.entitlementTypes.set(uid, metadata.DisplaySingular);
          display = metadata.DisplaySingular;
        }
        else {
          display = this.entitlementTypes.get(objKey.TableName);
        }

        this.entitlementTypes.set(uid, display);
      });
    } finally {
      this.requestsService.handleCloseLoader();
    }
  }
}
