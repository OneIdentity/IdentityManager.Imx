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

import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatChipList } from '@angular/material/chips';
import { from } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';

import { PortalItshopPeergroupMemberships, PortalShopServiceitems } from 'imx-api-qer';
import { CollectionLoadParameters, DisplayColumns, IClientProperty, IWriteValue, MultiValue } from 'imx-qbm-dbts';

import { Busy, BusyService, DataSourceToolbarComponent, DataSourceToolbarSettings, HELP_CONTEXTUAL, SettingsService } from 'qbm';
import { NewRequestOrchestrationService } from '../new-request-orchestration.service';
import { NewRequestProductApiService } from '../new-request-product/new-request-product-api.service';
import { ItshopService } from '../../itshop/itshop.service';
import { ServiceItemParameters } from '../new-request-product/service-item-parameters';
import { ProductDetailsService } from '../new-request-product/product-details-sidesheet/product-details.service';
import { SelectedProductSource } from '../new-request-selected-products/selected-product-item.interface';
import { NewRequestSelectionService } from '../new-request-selection.service';
import { CurrentProductSource } from '../current-product-source';
import { MatDialog } from '@angular/material/dialog';
import { PeerGroupDiscardSelectedComponent } from './peer-group-discard-selected.component';
import { NewRequestCategoryApiService } from '../new-request-product/new-request-category-api.service';

@Component({
  selector: 'imx-new-request-peer-group',
  templateUrl: './new-request-peer-group.component.html',
  styleUrls: ['./new-request-peer-group.component.scss'],
})
export class NewRequestPeerGroupComponent implements AfterViewInit, OnDestroy {
  //#region Private
  private subscriptions: Subscription[] = [];
  private busy: Busy;
  //#endregion

  //#region Public
  @ViewChild(MatChipList) public chipList: MatChipList;

  public selectedChipIndex = 0;
  public productDst: DataSourceToolbarComponent;
  public membershipDst: DataSourceToolbarComponent;
  public productDstSettings: DataSourceToolbarSettings;
  public membershipDstSettings: DataSourceToolbarSettings;
  public productNavigationState: CollectionLoadParameters | ServiceItemParameters;
  public membershipNavigationState: CollectionLoadParameters | ServiceItemParameters;
  public noDataText = '#LDS#No data';
  public DisplayColumns = DisplayColumns;
  public displayedProductColumns: IClientProperty[];
  public displayedMembershipColumns: IClientProperty[];
  public peerGroupSize = 0;
  public SelectedProductSource = SelectedProductSource;
  public selectedSource: SelectedProductSource;
  public contextId = HELP_CONTEXTUAL.NewRequestRecommendedProduct;
  //#endregion

  constructor(
    public readonly productApi: NewRequestProductApiService,
    public readonly membershipApi: ItshopService,
    public readonly productDetailsService: ProductDetailsService,
    public readonly selectionService: NewRequestSelectionService,
    public readonly orchestration: NewRequestOrchestrationService,
    private readonly categoryApi: NewRequestCategoryApiService,
    private readonly settingService: SettingsService,
    private readonly cd: ChangeDetectorRef,
    public readonly busyService: BusyService,
    private readonly dialog: MatDialog,
  ) {
    this.orchestration.selectedView = SelectedProductSource.PeerGroupProducts;
    this.orchestration.searchApi$.next(this.searchApi);
    this.orchestration.selectedChip = 0;

    this.displayedProductColumns = [
      this.productApi.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.productApi.entitySchema.Columns.CountInPeerGroup,
      this.productApi.entitySchema.Columns.ServiceCategoryFullPath,
      this.productApi.entitySchema.Columns.Description,
      this.productApi.entitySchema.Columns.OrderableStatus,
    ];

    this.displayedMembershipColumns = [
      this.membershipApi.PortalItshopPeergroupMembershipsSchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.membershipApi.PortalItshopPeergroupMembershipsSchema.Columns.CountInPeerGroup,
      this.membershipApi.PortalItshopPeergroupMembershipsSchema.Columns.FullPath,
      this.membershipApi.PortalItshopPeergroupMembershipsSchema.Columns.Description,
    ];

    //#region Subscriptions

    this.subscriptions.push(
      this.orchestration.currentProductSource$.subscribe(async (source: CurrentProductSource) => {
        this.selectedSource = source?.view;

        if (source?.view === SelectedProductSource.PeerGroupProducts) {
          this.productDst = source.dst;
          this.productDst.busyService = this.busyService;
          this.productDst.clearSearch();
          this.orchestration.dstSettingsPeerGroupProducts = this.productDstSettings;
          this.subscriptions.push(
            this.selectionService.selectedProducts$.subscribe(() => {
              this.orchestration.preselectBySource(SelectedProductSource.PeerGroupProducts, this.productDst);
            }),
          );
          this.subscriptions.push(
            this.productDst.searchResults$.subscribe((data) => {
              if (data) {
                this.productDstSettings = {
                  dataSource: data,
                  displayedColumns: this.displayedProductColumns,
                  entitySchema: this.productApi.entitySchema,
                  navigationState: this.productNavigationState,
                };
                this.orchestration.dstSettingsPeerGroupProducts = this.productDstSettings;
              }
              this.busy.endBusy(true);
            }),
          );
        }

        if (source?.view === SelectedProductSource.PeerGroupOrgs) {
          this.membershipDst = source.dst;
          this.membershipDst.busyService = this.busyService;
          this.membershipDst.clearSearch();
          this.orchestration.dstSettingsPeerGroupOrgs = this.membershipDstSettings;
          this.subscriptions.push(
            this.selectionService.selectedProducts$.subscribe(() => {
              this.orchestration.preselectBySource(SelectedProductSource.PeerGroupOrgs, this.membershipDst);
            }),
          );
          this.subscriptions.push(
            this.membershipDst.searchResults$.subscribe((data) => {
              if (data) {
                this.membershipDstSettings = {
                  dataSource: data,
                  displayedColumns: this.displayedMembershipColumns,
                  entitySchema: this.membershipApi.PortalItshopPeergroupMembershipsSchema,
                  navigationState: this.membershipNavigationState,
                };
                this.orchestration.dstSettingsPeerGroupOrgs = this.membershipDstSettings;
              }
              this.busy.endBusy(true);
            }),
          );
        }
      }),
    );

    this.subscriptions.push(
      this.orchestration.navigationState$.subscribe(async (navigation: CollectionLoadParameters | ServiceItemParameters) => {
        if (this.selectedChipIndex === 0 && this.selectedSource === SelectedProductSource.PeerGroupProducts) {
          this.productNavigationState = navigation;
          this.productDstSettings.displayedColumns = this.displayedProductColumns;
          await this.getProductData();
        }
        if (this.selectedChipIndex === 1 && this.selectedSource === SelectedProductSource.PeerGroupOrgs) {
          this.membershipNavigationState = navigation;
          this.membershipDstSettings.displayedColumns = this.displayedMembershipColumns;
          await this.getMembershipData();
        }
      }),
    );

    this.subscriptions.push(
      this.orchestration.recipients$.subscribe((recipients: IWriteValue<string>) => {
        this.getData();
      }),
    );

    this.subscriptions.push(
      this.selectionService.selectedProductsCleared$.subscribe(() => {
        this.productDst?.clearSelection();
        this.membershipDst?.clearSelection();
      }),
    );

    //#endregion
  }

  public ngAfterViewInit(): void {
    this.productNavigationState = { StartIndex: 0, PageSize: this.settingService.PageSizeForAllElements };
    this.membershipNavigationState = { StartIndex: 0, PageSize: this.settingService.PageSizeForAllElements };

    setTimeout(async () => {
      this.chipList.chips.first.select();
      await this.getProductData();
    });
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  public onSelectionChanged(items: PortalShopServiceitems[] | PortalItshopPeergroupMemberships[], type: SelectedProductSource): void {
    type === SelectedProductSource.PeerGroupProducts
      ? this.selectionService.addProducts(items, SelectedProductSource.PeerGroupProducts)
      : this.selectionService.addProducts(items, SelectedProductSource.PeerGroupOrgs);
  }

  public searchApi = () => {
    this.busy = this.busyService.beginBusy();
    this.orchestration.abortCall();
    if (this.selectedChipIndex === 0) {
      const parameters = this.getCollectionLoadParamaters(this.productNavigationState);
      return from(this.productApi.get(parameters));
    }
    if (this.selectedChipIndex === 1) {
      const parameters = this.getCollectionLoadParamaters(this.membershipNavigationState);
      return from(this.membershipApi.getPeerGroupMemberships(parameters, { signal: this.orchestration.abortController.signal }));
    }
  };

  public async onRowSelected(item: PortalShopServiceitems): Promise<void> {
    this.productDetailsService.showProductDetails(item, this.orchestration.recipients);
  }

  public getCIPGCurrentValue(prod: any): number {
    return (100 * prod.CountInPeerGroup?.value) / this.peerGroupSize;
  }

  public async onChipClicked(index: number): Promise<void> {
    this.selectedChipIndex = index;
    this.orchestration.selectedChip = index;
    // this.orchestration.clearSearch$.next(true);

    this.chipList.chips.forEach((chip, i) => {
      i === index ? (chip.selected = true) : (chip.selected = false);
    });

    if (index === 0) {
      this.orchestration.selectedView = SelectedProductSource.PeerGroupProducts;
      // this.orchestration.dstSettingsPeerGroupProducts = this.productDstSettings;
      // this.productNavigationState = { StartIndex: 0 };
      // this.productDst.clearSearch();
      await this.getProductData();
      this.orchestration.preselectBySource(SelectedProductSource.PeerGroupProducts, this.productDst);
    }

    if (index === 1) {
      this.orchestration.selectedView = SelectedProductSource.PeerGroupOrgs;
      // this.orchestration.dstSettingsPeerGroupOrgs = this.membershipDstSettings;
      // this.membershipNavigationState = { StartIndex: 0 };
      // this.membershipDst.clearSearch();
      await this.getMembershipData();
      this.orchestration.preselectBySource(SelectedProductSource.PeerGroupOrgs, this.membershipDst);
    }
  }

  private async getData(): Promise<void> {
    if (this.selectedChipIndex === 0 && this.selectedSource === SelectedProductSource.PeerGroupProducts) {
      await this.getProductData();
    }
    if (this.selectedChipIndex === 1 && this.selectedSource === SelectedProductSource.PeerGroupOrgs) {
      await this.getMembershipData();
    }
  }

  private async getProductData(): Promise<void> {
    let busy;
    let load: boolean;

    try {
      this.cd.detectChanges();
      this.orchestration.abortCall();
      let recipientsVals = MultiValue.FromString(this.orchestration.recipients.Column.GetValue())?.GetValues();
      if (recipientsVals.length > 1) {
        if (this.selectionService.selectedProducts.length > 0) {
          load = await this.discardSelectedProducts();

          if (!load) {
            return;
          }
        }

        // select first recipient
        // TODO #427279: ask user to select one of his recipients
        const firstRecipient = {
          DataValue: recipientsVals?.[0],
          DisplayValue: MultiValue.FromString(this.orchestration.recipients.Column.GetDisplayValue()).GetValues()?.[0],
        };
        await this.orchestration.setRecipients(firstRecipient);
      }

      setTimeout(() => (busy = this.busyService.beginBusy()));

      const userParams = {
        UID_Person: this.orchestration.recipients
          ? MultiValue.FromString(this.orchestration.recipients.value).GetValues().join(',')
          : undefined,
        ParentKey: '',
        PageSize: -1,
      };
      const servicecategories = await this.categoryApi.get(userParams);
      const serviceCategoriesTotalCount = servicecategories?.totalCount;

      if (serviceCategoriesTotalCount < 1) {
        this.orchestration.disableSearch = true;
        return;
      }

      this.orchestration.disableSearch = false;
      const parameters = this.getCollectionLoadParamaters(this.productNavigationState);
      let data = await this.productApi.get(parameters);

      if (data) {
        // sort by CountInPeerGroup value
        data.Data?.sort((a, b) => {
          if (a?.CountInPeerGroup?.value < b?.CountInPeerGroup.value) return 1;
          if (a?.CountInPeerGroup?.value > b?.CountInPeerGroup.value) return -1;
          return a
            ?.GetEntity()
            .GetDisplay()
            .localeCompare(b?.GetEntity().GetDisplay());
        });

        this.peerGroupSize = data.extendedData?.PeerGroupSize | 0;
        this.productDstSettings = {
          dataSource: data,
          displayedColumns: this.displayedProductColumns,
          entitySchema: this.productApi.entitySchema,
          navigationState: this.productNavigationState,
        };
        this.orchestration.dstSettingsPeerGroupProducts = this.productDstSettings;
      }
    } finally {
      busy?.endBusy();
    }
  }

  private async getMembershipData(): Promise<void> {
    let busy;
    try {
      this.cd.detectChanges();
      this.orchestration.abortCall();
      // let recipientsVals = MultiValue.FromString(this.orchestration.recipients.Column.GetValue());
      // if (recipientsVals.GetValues().length > 1) {
      //   await this.orchestration.setDefaultUser();
      // }

      setTimeout(() => (busy = this.busyService.beginBusy()));
      this.cd.detectChanges();
      const parameters = this.getCollectionLoadParamaters(this.membershipNavigationState);
      let data = await this.membershipApi.getPeerGroupMemberships(parameters, { signal: this.orchestration.abortController.signal });

      if (data) {
        // sort by CountInPeerGroup value
        data.Data?.sort((a, b) => {
          if (a?.CountInPeerGroup?.value < b?.CountInPeerGroup.value) return 1;
          if (a?.CountInPeerGroup?.value > b?.CountInPeerGroup.value) return -1;
          return a
            ?.GetEntity()
            .GetDisplay()
            .localeCompare(b?.GetEntity().GetDisplay());
        });

        this.orchestration.disableSearch = data.totalCount < 1;
        this.peerGroupSize = data.extendedData.PeerGroupSize;
        this.membershipDstSettings = {
          dataSource: data,
          displayedColumns: this.displayedMembershipColumns,
          entitySchema: this.membershipApi.PortalItshopPeergroupMembershipsSchema,
          navigationState: this.membershipNavigationState,
        };

        this.orchestration.dstSettingsPeerGroupOrgs = this.membershipDstSettings;
      }
    } finally {
      busy?.endBusy();
    }
  }

  private getCollectionLoadParamaters(
    navigationState: CollectionLoadParameters | ServiceItemParameters,
  ): CollectionLoadParameters | ServiceItemParameters {
    return {
      ...navigationState,
      UID_Person: this.orchestration.recipients
        ? MultiValue.FromString(this.orchestration.recipients.value).GetValues().join(',')
        : undefined,
      UID_PersonPeerGroup: this.orchestration.recipients
        ? MultiValue.FromString(this.orchestration.recipients.value).GetValues().join(',')
        : undefined,
    };
  }

  private async discardSelectedProducts(): Promise<boolean> {
    const dialogRef = this.dialog.open(PeerGroupDiscardSelectedComponent);

    let result = await dialogRef.afterClosed().toPromise();
    return result;
  }
}
