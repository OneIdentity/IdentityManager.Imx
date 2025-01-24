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
import { from, Subscription } from 'rxjs';

import { PortalItshopPatternItem, PortalItshopPatternRequestable } from 'imx-api-qer';
import {
  CollectionLoadParameters,
  CompareOperator,
  DisplayColumns,
  EntitySchema,
  FilterType,
  IClientProperty,
  IWriteValue,
} from 'imx-qbm-dbts';
import { Busy, BusyService, DataSourceToolbarComponent, DataSourceToolbarSettings, DataSourceWrapper } from 'qbm';

import { PatternItemService } from '../../../pattern-item-list/pattern-item.service';
import { NewRequestOrchestrationService } from '../../new-request-orchestration.service';
import { SelectedProductSource } from '../../new-request-selected-products/selected-product-item.interface';
import { ProductDetailsService } from '../../new-request-product/product-details-sidesheet/product-details.service';
import { ServiceItemsService } from '../../../service-items/service-items.service';
import { NewRequestSelectionService } from '../../new-request-selection.service';
import { CurrentProductSource } from '../../current-product-source';

@Component({
  selector: 'imx-product-bundle-items',
  templateUrl: './product-bundle-items.component.html',
  styleUrls: ['./product-bundle-items.component.scss'],
})
export class ProductBundleItemsComponent implements OnInit, OnDestroy {
  // #region Private
  private subscriptions: Subscription[] = [];
  private readonly myBusyService = new BusyService();
  private busy: Busy;

  // #endregion

  // #region Public
  public dst: DataSourceToolbarComponent;
  public DisplayColumns = DisplayColumns;
  public displayedColumns: IClientProperty[];
  public dstWrapper: DataSourceWrapper<PortalItshopPatternItem>;
  public dstSettings: DataSourceToolbarSettings;
  public navigationState: CollectionLoadParameters;
  public recipients: IWriteValue<string>;
  public selectedProductBundle: PortalItshopPatternRequestable;
  public entitySchema: EntitySchema;
  public searchApi = () => {
    this.busy = this.myBusyService.beginBusy();
    this.orchestration.abortCall();

    let parameters: CollectionLoadParameters = {
      ...this.orchestration.dstSettingsProductBundles.navigationState,
    };

    return from(
      this.patternItemService.getPatternItemList(this.selectedProductBundle, parameters, {
        signal: this.orchestration.abortController.signal,
      })
    );
  };
  // #endregion

  constructor(
    public readonly orchestration: NewRequestOrchestrationService,
    public readonly selectionService: NewRequestSelectionService,
    private readonly patternItemService: PatternItemService,
    private readonly productDetailsService: ProductDetailsService,
    private readonly serviceItemsService: ServiceItemsService
  ) {
    this.orchestration.selectedView = SelectedProductSource.ProductBundles;
    this.orchestration.searchApi$.next(this.searchApi);

    this.entitySchema = this.patternItemService.PortalItshopPatternItemSchema;
    this.displayedColumns = [
      this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchema.Columns.TableName,
      this.entitySchema.Columns.Description,
    ];
    this.dstWrapper = new DataSourceWrapper(
      (state, requestOpts, isInitial) =>
        isInitial
          ? Promise.resolve({ totalCount: 0, Data: [] })
          : this.patternItemService.getPatternItemList(this.selectedProductBundle, state, requestOpts),
      this.displayedColumns,
      this.entitySchema
    );

    //#region Subscriptions

    this.subscriptions.push(
      this.orchestration.currentProductSource$.subscribe((source: CurrentProductSource) => {
        if (source?.view === SelectedProductSource.ProductBundles) {
          this.dst = source.dst;
          this.dst.busyService = this.myBusyService;
          this.dst.clearSearch();
          this.orchestration.dstSettingsProductBundles = this.dstSettings;

          this.subscriptions.push(
            this.dst.searchResults$.subscribe((data) => {
              if (data) {
                this.dstSettings = {
                  dataSource: data,
                  displayedColumns: this.displayedColumns,
                  entitySchema: this.entitySchema,
                  navigationState: this.navigationState,
                };
                this.orchestration.dstSettingsProductBundles = this.dstSettings;
              }
              this.busy.endBusy(true);
            })
          );
        }
      })
    );

    this.subscriptions.push(
      this.orchestration.navigationState$.subscribe(async (navigation: CollectionLoadParameters) => {
        this.navigationState = navigation;
        this.updateDisplayedColumns(this.displayedColumns);
        await this.getData();
      })
    );

    this.subscriptions.push(
      this.orchestration.productBundle$.subscribe(async (productBundle: PortalItshopPatternRequestable) => {
        this.selectedProductBundle = productBundle;
        if (this.selectedProductBundle) {
          this.updateDisplayedColumns(this.displayedColumns);
          await this.getData();
          this.orchestration.preselectBySource(SelectedProductSource.ProductBundles, this.dst);
        }
      })
    );

    this.subscriptions.push(this.orchestration.recipients$.subscribe((recipients: IWriteValue<string>) => (this.recipients = recipients)));

    this.subscriptions.push(
      this.selectionService.selectedProducts$.subscribe(() => {
        this.orchestration.preselectBySource(SelectedProductSource.ProductBundles, this.dst);
      })
    );

    this.subscriptions.push(this.selectionService.selectedProductsCleared$.subscribe(() => this.dst?.clearSelection()));

    //#endregion
  }

  public async ngOnInit(): Promise<void> {
    this.navigationState = { StartIndex: 0 };
    await this.getData(true);
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public async getData(isInitialLoad: boolean = false): Promise<void> {
    if (!this.selectedProductBundle) {
      this.orchestration.disableSearch = true;
      return;
    }
    this.orchestration.disableSearch = false;
    const busy = this.myBusyService.beginBusy();
    try {
      this.orchestration.abortCall();
      this.dstSettings = await this.dstWrapper.getDstSettings(
        this.navigationState,
        { signal: this.orchestration.abortController.signal },
        isInitialLoad
      );
      this.orchestration.dstSettingsProductBundles = this.dstSettings;
    } finally {
      busy.endBusy();
    }
  }

  public async onRowSelected(item: PortalItshopPatternItem): Promise<void> {
    const serviceItem = await this.serviceItemsService.getServiceItem(item.UID_AccProduct.value, true);
    this.productDetailsService.showProductDetails(serviceItem, this.recipients);
  }

  public onSelectionChanged(items: PortalItshopPatternItem[]): void {
    this.selectionService.addProducts(items, SelectedProductSource.ProductBundles, false, this.selectedProductBundle);
  }

  public async onSelectBundle(): Promise<void> {
    const busy = this.myBusyService.beginBusy();

    try {
      const items = await this.patternItemService.getPatternItemList(this.selectedProductBundle, undefined, undefined, true);
      if (items?.Data) {
        this.selectionService.addProducts(items.Data, SelectedProductSource.ProductBundles, true, this.selectedProductBundle);
        this.orchestration.preselectBySource(SelectedProductSource.ProductBundles, this.dst);
      }
    } finally {
      busy.endBusy();
    }
  }

  public async onUnselectBundle(): Promise<void> {
    this.selectionService.addProducts([], SelectedProductSource.ProductBundles, true, this.selectedProductBundle);
    this.orchestration.preselectBySource(SelectedProductSource.ProductBundles, this.dst);
  }

  private updateDisplayedColumns(displayedColumns: IClientProperty[]): void {
    if (this.dstSettings) {
      this.dstSettings.displayedColumns = displayedColumns;
      this.orchestration.dstSettingsProductBundles = this.dstSettings;
    }
  }
}
