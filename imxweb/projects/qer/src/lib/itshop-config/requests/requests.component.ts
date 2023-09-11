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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { PortalShopConfigStructure } from 'imx-api-qer';
import { CollectionLoadParameters, IClientProperty, DisplayColumns, EntitySchema } from 'imx-qbm-dbts';
import {
  DataSourceToolbarSettings,
  DataSourceToolbarFilter,
  ClassloggerService,
  StorageService,
  HELPER_ALERT_KEY_PREFIX,
  SettingsService,
  BusyService,
  HelpContextualComponent,
  HelpContextualService,
  HELP_CONTEXTUAL
} from 'qbm';
import { RequestConfigSidesheetComponent } from '../request-config-sidesheet/request-config-sidesheet.component';
import { RequestsService } from '../requests.service';

const helperAlertKey = `${HELPER_ALERT_KEY_PREFIX}_requestShop`;

@Component({
  selector: 'imx-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss'],
})
export class RequestsComponent implements OnInit, OnDestroy {
  public get showHelperAlert(): boolean {
    return !this.storageService.isHelperAlertDismissed(helperAlertKey);
  }

  public readonly entitySchemaShopStructure: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;
  public dstSettings: DataSourceToolbarSettings;
  public navigationState: CollectionLoadParameters;
  public filterOptions: DataSourceToolbarFilter[] = [];

  public busyService = new BusyService();

  private displayedColumns: IClientProperty[] = [];

  constructor(
    private readonly sidesheet: EuiSidesheetService,
    private readonly logger: ClassloggerService,
    private readonly translate: TranslateService,
    private readonly storageService: StorageService,
    public readonly requestsService: RequestsService,
    private readonly settingsService: SettingsService,
    private readonly helpContextualService: HelpContextualService
  ) {
    this.navigationState = { PageSize: this.settingsService.DefaultPageSize, StartIndex: 0 };
    this.entitySchemaShopStructure = requestsService.shopStructureSchema;
  }

  public async ngOnInit(): Promise<void> {
    this.displayedColumns = [
      this.entitySchemaShopStructure.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchemaShopStructure.Columns.UID_OrgAttestator,
    ];
    await this.navigate();
  }

  public ngOnDestroy(): void {
    this.sidesheet.close();
  }

  public onHelperDismissed(): void {
    this.storageService.storeHelperAlertDismissal(helperAlertKey);
  }

  public async onSearch(keywords: string): Promise<void> {
    this.logger.debug(this, `Searching for: ${keywords}`);
    this.navigationState.StartIndex = 0;
    this.navigationState.search = keywords;
    await this.navigate();
  }

  public onRequestShopSelected(requestConfig: PortalShopConfigStructure): void {
    this.logger.debug(this, `Selected shop changed`);
    this.logger.trace(`New shop selected`, requestConfig);
    this.viewRequestShop(requestConfig);
  }

  public async createRequestConfig(): Promise<void> {
    const newRequestConfig = this.requestsService.createRequestConfigEntity();
    newRequestConfig.ITShopInfo.value = 'SH';
    this.viewRequestShop(newRequestConfig, true);
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

  private async viewRequestShop(requestConfig: PortalShopConfigStructure, isNew: boolean = false): Promise<void> {
    const key = isNew ? this.requestsService.LdsHeadingCreateShop : this.requestsService.LdsHeadingEditShop;
    if(isNew){
      this.helpContextualService.setHelpContextId(HELP_CONTEXTUAL.ConfigurationRequestsCreate);
    }
    const result = await this.sidesheet
      .open(RequestConfigSidesheetComponent, {
        title: await this.translate.get(key).toPromise(),
        subTitle: isNew ? '' : requestConfig.GetEntity().GetDisplay(),
        padding: '0px',
        disableClose: true,
        width: 'max(60%,600px)',
        testId: isNew ? 'requests-config-create-shop-sidesheet' : 'requests-config-edit-shop-sidesheet',
        data: {
          requestConfig,
          isNew,
        },
        headerComponent: isNew ? HelpContextualComponent : undefined
      })
      .afterClosed()
      .toPromise();
    // After the sidesheet closes, reload the current data to refresh any changes that might have been made
    if (result) {
      this.navigate();
    }
  }

  private async navigate(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    const getParams: any = this.navigationState;

    try {
      const data = await this.requestsService.getShopStructures(getParams, '');
      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: data,
        entitySchema: this.entitySchemaShopStructure,
        navigationState: this.navigationState,
        filters: this.filterOptions,
      };
      this.logger.debug(this, `Head at ${data.Data.length + this.navigationState.StartIndex} of ${data.totalCount} item(s)`);
    } finally {
      isBusy?.endBusy();
    }
  }
}
