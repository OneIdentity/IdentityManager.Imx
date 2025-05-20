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

import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { from } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';

import { PortalItshopPeergroupMemberships } from '@imx-modules/imx-api-qer';
import { CollectionLoadParameters, DisplayColumns, IClientProperty, IWriteValue, MultiValue, TypedEntity } from '@imx-modules/imx-qbm-dbts';

import { MatDialog } from '@angular/material/dialog';
import {
  Busy,
  BusyService,
  DataSourceToolbarComponent,
  DataSourceToolbarSettings,
  HELP_CONTEXTUAL,
  ImxTranslationProviderService,
  SettingsService,
} from 'qbm';
import { ItshopService } from '../../itshop/itshop.service';
import { CurrentProductSource } from '../current-product-source';
import { NewRequestOrchestrationService } from '../new-request-orchestration.service';
import { NewRequestCategoryApiService } from '../new-request-product/new-request-category-api.service';
import { NewRequestProductApiService } from '../new-request-product/new-request-product-api.service';
import { ProductDetailsService } from '../new-request-product/product-details-sidesheet/product-details.service';
import { ServiceItemParameters } from '../new-request-product/service-item-parameters';
import { SelectedProductSource } from '../new-request-selected-products/selected-product-item.interface';
import { NewRequestSelectionService } from '../new-request-selection.service';
import { PeerGroupDiscardSelectedComponent } from './peer-group-discard-selected.component';

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
  public readonly currentCulture: string;
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
    private readonly translationProviderService: ImxTranslationProviderService,
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

    this.currentCulture = this.translationProviderService.CultureFormat;

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
          if (this.productDstSettings) {
            this.productDstSettings.displayedColumns = this.displayedProductColumns;
            await this.getProductData();
          }
        }
        if (this.selectedChipIndex === 1 && this.selectedSource === SelectedProductSource.PeerGroupOrgs) {
          this.membershipNavigationState = navigation;
          if (this.membershipDstSettings) {
            this.membershipDstSettings.displayedColumns = this.displayedMembershipColumns;
            await this.getMembershipData();
          }
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

  public async ngAfterViewInit(): Promise<void> {
    this.productNavigationState = { StartIndex: 0, PageSize: this.settingService.PageSizeForAllElements };
    this.membershipNavigationState = { StartIndex: 0, PageSize: this.settingService.PageSizeForAllElements };

    await this.getProductData();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  public onSelectionChanged(items: TypedEntity[] | PortalItshopPeergroupMemberships[], type: SelectedProductSource): void {
    type === SelectedProductSource.PeerGroupProducts
      ? this.selectionService.addProducts(items, SelectedProductSource.PeerGroupProducts)
      : this.selectionService.addProducts(items, SelectedProductSource.PeerGroupOrgs);
  }

  public searchApi = (keywords: string) => {
    this.busy = this.busyService.beginBusy();
    this.orchestration.abortCall();
    if (this.selectedChipIndex === 0) {
      const parameters = { ...this.getCollectionLoadParamaters(this.productNavigationState), search: keywords };
      return from(this.productApi.get(parameters));
    }
    if (this.selectedChipIndex === 1) {
      const parameters = { ...this.getCollectionLoadParamaters(this.membershipNavigationState), search: keywords };
      return from(this.membershipApi.getPeerGroupMemberships(parameters, { signal: this.orchestration.abortController.signal }));
    }

    return undefined;
  };

  public async onRowSelected(item: TypedEntity): Promise<void> {
    this.productDetailsService.showProductDetails(item, this.orchestration.recipients);
  }

  public getCIPGCurrentValue(prod: any): number {
    return (100 * prod.CountInPeerGroup?.value) / this.peerGroupSize;
  }

  public async onChipClicked(index: number): Promise<void> {
    this.selectedChipIndex = index;
    this.orchestration.selectedChip = index;
    // this.orchestration.clearSearch$.next(true);

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
    if (!this.orchestration.isLoggedIn) {
      return;
    }
    let busy;
    let load: boolean;

    try {
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

      busy = this.busyService.beginBusy();

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
          return a?.GetEntity().GetDisplay().localeCompare(b?.GetEntity().GetDisplay());
        });

        this.peerGroupSize = data.extendedData?.PeerGroupSize || 0;
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
    if (!this.orchestration.isLoggedIn) {
      return;
    }
    let busy;
    try {
      this.orchestration.abortCall();
      // let recipientsVals = MultiValue.FromString(this.orchestration.recipients.Column.GetValue());
      // if (recipientsVals.GetValues().length > 1) {
      //   await this.orchestration.setDefaultUser();
      // }

      busy = this.busyService.beginBusy();
      this.cd.detectChanges();
      const parameters = this.getCollectionLoadParamaters(this.membershipNavigationState);
      let data = await this.membershipApi.getPeerGroupMemberships(parameters, { signal: this.orchestration.abortController.signal });

      if (data) {
        // sort by CountInPeerGroup value
        data.Data?.sort((a, b) => {
          if (a?.CountInPeerGroup?.value < b?.CountInPeerGroup.value) return 1;
          if (a?.CountInPeerGroup?.value > b?.CountInPeerGroup.value) return -1;
          return a?.GetEntity().GetDisplay().localeCompare(b?.GetEntity().GetDisplay());
        });

        this.orchestration.disableSearch = data.totalCount < 1;
        this.peerGroupSize = data.extendedData?.PeerGroupSize || 0;
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
