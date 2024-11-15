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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { PortalShopConfigStructure } from '@imx-modules/imx-api-qer';
import {
  CollectionLoadParameters,
  DisplayColumns,
  EntitySchema,
  IClientProperty,
  TypedEntityCollectionData,
} from '@imx-modules/imx-qbm-dbts';
import {
  BusyService,
  calculateSidesheetWidth,
  DataViewInitParameters,
  DataViewSource,
  HELP_CONTEXTUAL,
  HelpContextualComponent,
  HelpContextualService,
  HELPER_ALERT_KEY_PREFIX,
  StorageService,
} from 'qbm';
import { RequestConfigSidesheetComponent } from '../request-config-sidesheet/request-config-sidesheet.component';
import { RequestsService } from '../requests.service';

const helperAlertKey = `${HELPER_ALERT_KEY_PREFIX}_requestShop`;

@Component({
  selector: 'imx-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss'],
  providers: [DataViewSource],
})
export class RequestsComponent implements OnInit, OnDestroy {
  public get showHelperAlert(): boolean {
    return !this.storageService.isHelperAlertDismissed(helperAlertKey);
  }

  public readonly entitySchemaShopStructure: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;

  public busyService = new BusyService();

  private displayedColumns: IClientProperty[] = [];

  constructor(
    private readonly sidesheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly storageService: StorageService,
    public readonly requestsService: RequestsService,
    private readonly helpContextualService: HelpContextualService,
    public dataSource: DataViewSource<PortalShopConfigStructure>,
  ) {
    this.entitySchemaShopStructure = requestsService.shopStructureSchema;
  }

  public async ngOnInit(): Promise<void> {
    this.displayedColumns = [
      this.entitySchemaShopStructure.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchemaShopStructure.Columns.UID_OrgAttestator,
    ];
    await this.initDataTable();
  }

  public ngOnDestroy(): void {
    this.sidesheet.close();
  }

  public onHelperDismissed(): void {
    this.storageService.storeHelperAlertDismissal(helperAlertKey);
  }

  public async createRequestConfig(): Promise<void> {
    const newRequestConfig = this.requestsService.createRequestConfigEntity();
    newRequestConfig.ITShopInfo.value = 'SH';
    this.viewRequestShop(newRequestConfig, true);
  }

  private async viewRequestShop(requestConfig: PortalShopConfigStructure, isNew: boolean = false): Promise<void> {
    const key = isNew ? this.requestsService.LdsHeadingCreateShop : this.requestsService.LdsHeadingEditShop;
    if (isNew) {
      this.helpContextualService.setHelpContextId(HELP_CONTEXTUAL.ConfigurationRequestsCreate);
    }
    const result = await this.sidesheet
      .open(RequestConfigSidesheetComponent, {
        title: await this.translate.get(key).toPromise(),
        subTitle: isNew ? '' : requestConfig.GetEntity().GetDisplay(),
        padding: '0px',
        disableClose: true,
        width: calculateSidesheetWidth(),
        testId: isNew ? 'requests-config-create-shop-sidesheet' : 'requests-config-edit-shop-sidesheet',
        data: {
          requestConfig,
          isNew,
        },
        headerComponent: isNew ? HelpContextualComponent : undefined,
      })
      .afterClosed()
      .toPromise();
    // After the sidesheet closes, reload the current data to refresh any changes that might have been made
    if (result) {
      this.dataSource.updateState();
    }
  }

  private initDataTable(): void {
    const dataViewInitParameters: DataViewInitParameters<PortalShopConfigStructure> = {
      execute: (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<PortalShopConfigStructure>> =>
        this.requestsService.getShopStructures(params, '', signal),
      schema: this.entitySchemaShopStructure,
      columnsToDisplay: this.displayedColumns,
      highlightEntity: (entity: PortalShopConfigStructure) => {
        this.viewRequestShop(entity);
      },
    };
    this.dataSource.init(dataViewInitParameters);
  }
}
