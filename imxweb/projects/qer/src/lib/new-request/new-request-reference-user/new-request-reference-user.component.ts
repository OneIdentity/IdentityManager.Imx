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
import { MatChipList, MatChipListChange } from '@angular/material/chips';
import { NavigationEnd, Router } from '@angular/router';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { from } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';

import { PortalItshopPeergroupMemberships, PortalShopServiceitems } from 'imx-api-qer';
import { CollectionLoadParameters, DisplayColumns, IClientProperty, IWriteValue, MultiValue, ValueStruct } from 'imx-qbm-dbts';

import { Busy, BusyService, DataSourceToolbarComponent, DataSourceToolbarSettings, FkAdvancedPickerComponent, HELP_CONTEXTUAL } from 'qbm';
import { ItshopService } from '../../itshop/itshop.service';
import { QerApiService } from '../../qer-api-client.service';
import { CurrentProductSource } from '../current-product-source';
import { NewRequestOrchestrationService } from '../new-request-orchestration.service';
import { NewRequestProductApiService } from '../new-request-product/new-request-product-api.service';
import { ProductDetailsService } from '../new-request-product/product-details-sidesheet/product-details.service';
import { ServiceItemParameters } from '../new-request-product/service-item-parameters';
import { SelectedProductSource } from '../new-request-selected-products/selected-product-item.interface';
import { NewRequestSelectionService } from '../new-request-selection.service';

@Component({
  selector: 'imx-new-request-reference-user',
  templateUrl: './new-request-reference-user.component.html',
  styleUrls: ['./new-request-reference-user.component.scss'],
})
export class NewRequestReferenceUserComponent implements AfterViewInit, OnDestroy {
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
  public recipients: IWriteValue<string>;
  public readonly busyService = new BusyService();
  public SelectedProductSource = SelectedProductSource;
  public selectedSource: SelectedProductSource;
  public contextId = HELP_CONTEXTUAL.NewRequestReferenceUser;
  //#endregion

  constructor(
    public readonly productApi: NewRequestProductApiService,
    public readonly membershipApi: ItshopService,
    public readonly selectionService: NewRequestSelectionService,
    private readonly cd: ChangeDetectorRef,
    private readonly sideSheetService: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly qerApi: QerApiService,
    private readonly orchestration: NewRequestOrchestrationService,
    private readonly productDetailsService: ProductDetailsService,
    private readonly router: Router
  ) {
    this.orchestration.selectedView = SelectedProductSource.ReferenceUserProducts;
    this.orchestration.selectedChip = 0;

    // CHECK Do we need this?
    this.orchestration.searchApi$.next(this.searchApi);

    this.displayedProductColumns = [
      this.productApi.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.productApi.entitySchema.Columns.ServiceCategoryFullPath,
      this.productApi.entitySchema.Columns.TableName,
      this.productApi.entitySchema.Columns.Description,
      this.productApi.entitySchema.Columns.OrderableStatus,
    ];

    this.displayedMembershipColumns = [
      this.membershipApi.PortalItshopPeergroupMembershipsSchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.membershipApi.PortalItshopPeergroupMembershipsSchema.Columns.FullPath,
      this.membershipApi.PortalItshopPeergroupMembershipsSchema.Columns.Description,
    ];

    //#region Sunscription
    this.subscriptions.push(
      this.orchestration.currentProductSource$.subscribe((source: CurrentProductSource) => {
        this.selectedSource = source?.view;

        if (source?.view === SelectedProductSource.ReferenceUserProducts) {
          this.productDst = source.dst;
          this.productDst.busyService = this.busyService;
          this.orchestration.dstSettingsReferenceUserProducts = this.productDstSettings;
          // this.getProductData();
          this.subscriptions.push(this.selectionService.selectedProducts$.subscribe(() => {
            this.orchestration.preselectBySource(SelectedProductSource.ReferenceUserProducts, this.productDst);
          }));
          this.subscriptions.push(
            this.productDst.searchResults$.subscribe((data) => {
              if (data) {
                this.productDstSettings = {
                  dataSource: data,
                  displayedColumns: this.displayedProductColumns,
                  entitySchema: this.productApi.entitySchema,
                  navigationState: this.productNavigationState,
                };
                this.orchestration.dstSettingsReferenceUserProducts = this.productDstSettings;
              }
              this.busy.endBusy(true);
            })
          );
        }

        if (source?.view === SelectedProductSource.ReferenceUserOrgs) {
          this.membershipDst = source.dst;
          this.membershipDst.busyService = this.busyService;
          this.orchestration.dstSettingsReferenceUserOrgs = this.membershipDstSettings;
          this.subscriptions.push(this.selectionService.selectedProducts$.subscribe(() => {
            this.orchestration.preselectBySource(SelectedProductSource.ReferenceUserOrgs, this.membershipDst);
          }));
          this.subscriptions.push(
            this.membershipDst.searchResults$.subscribe((data) => {
              if (data) {
                this.membershipDstSettings = {
                  dataSource: data,
                  displayedColumns: this.displayedMembershipColumns,
                  entitySchema: this.membershipApi.PortalItshopPeergroupMembershipsSchema,
                  navigationState: this.membershipNavigationState,
                };
                this.orchestration.dstSettingsReferenceUserOrgs= this.membershipDstSettings;
              }
              this.busy.endBusy(true);
            })
          );
        }
      })
    );

    this.subscriptions.push(
      this.orchestration.navigationState$.subscribe(async (navigation: CollectionLoadParameters | ServiceItemParameters) => {
        if (this.selectedChipIndex === 0 && this.selectedSource === SelectedProductSource.ReferenceUserProducts) {
          this.productNavigationState = navigation;
          this.orchestration.dstSettingsReferenceUserProducts = this.productDstSettings;
          await this.getProductData();
        }
        if (this.selectedChipIndex === 1 && this.selectedSource === SelectedProductSource.ReferenceUserOrgs) {
          this.membershipNavigationState = navigation;
          this.orchestration.dstSettingsReferenceUserOrgs = this.membershipDstSettings;
          await this.getMembershipData();
        }
      })
    );

    this.subscriptions.push(
      this.selectionService.selectedProductsCleared$.subscribe(() => {
        this.productDst?.clearSelection();
        this.membershipDst?.clearSelection();
      })
    );

    this.subscriptions.push(this.orchestration.recipients$.subscribe((recipients: IWriteValue<string>) => (this.recipients = recipients)));

    this.subscriptions.push(
      this.router.events.subscribe(async (event: any) => {
        if (event instanceof NavigationEnd && this.orchestration.referenceUser != null && event.url === '/newrequest/selectReferenceUser') {
          await this.selectReferenceUser();
        }
      })
    );

    //#endregion
  }

  public async ngAfterViewInit(): Promise<void> {
    this.productNavigationState = { StartIndex: 0 };
    this.membershipNavigationState = { StartIndex: 0 };

    if (!this.orchestration.referenceUser) {
      await this.selectReferenceUser();
    } else {
      this.chipList.chips.first.select();
      this.cd.detectChanges();
      await this.getProductData();
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
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

  public async selectReferenceUser(): Promise<void> {
    const disabledIds =
      this.recipients.Column?.GetValue()?.split('').length === 1 ? this.recipients.Column?.GetValue()?.split('') : undefined;

    const selection = await this.sideSheetService
      .open(FkAdvancedPickerComponent, {
        title: await this.translate.get('#LDS#Heading Select Reference User').toPromise(),
        padding: '0',
        icon: 'user',
        width: 'min(60%, 800px)',
        testId: 'referenceUser-sidesheet',
        data: {
          displayValue: '',
          fkRelations: this.qerApi.typedClient.PortalCartitem.createEntity().UID_PersonOrdered.GetMetadata().GetFkRelations(),
          isMultiValue: false,
          disabledIds: disabledIds,
        },
      })
      .afterClosed()
      .toPromise();

    selection && selection.candidates?.length > 0
      ? await this.setReferenceUser(selection.candidates[0])
      : this.router.navigate(['/newrequest']);
  }

  public async setReferenceUser(user: ValueStruct<string>): Promise<void> {
    if (this.orchestration.referenceUser?.DataValue === user?.DataValue) {
      return;
    }

    this.orchestration.referenceUser = user

    this.productNavigationState = { StartIndex: 0 };
    this.membershipNavigationState = { StartIndex: 0 };
    this.chipList.chips.first.select();
    await this.getProductData();
  }

  public async onRowSelected(item: PortalShopServiceitems): Promise<void> {
    this.productDetailsService.showProductDetails(item, this.recipients);
  }

  public onProductSelectionChanged(items: PortalShopServiceitems[] | PortalItshopPeergroupMemberships[], type: SelectedProductSource): void {
    type === SelectedProductSource.ReferenceUserProducts
    ? this.selectionService.addProducts(items, SelectedProductSource.ReferenceUserProducts)
    : this.selectionService.addProducts(items, SelectedProductSource.ReferenceUserOrgs);
  }

  public onChipListChange(event: MatChipListChange): void {}

  public async onChipClicked(index: number): Promise<void> {
    this.selectedChipIndex = index;
    this.orchestration.selectedChip = index;
    // this.orchestration.clearSearch$.next(true);

    this.chipList.chips.forEach((chip, i) => {
      i === index ? (chip.selected = true) : (chip.selected = false);
    });

    if (index === 0) {
      this.orchestration.selectedView = SelectedProductSource.ReferenceUserProducts;
      // this.productNavigationState = { StartIndex: 0 };
      // this.updateDisplayedColumns(this.displayedProductColumns);
      // this.dst.clearSearch();
      await this.getProductData();
    }

    if (index === 1) {
      this.orchestration.selectedView = SelectedProductSource.ReferenceUserOrgs;
      // this.membershipNavigationState = { StartIndex: 0 };
      // this.updateDisplayedColumns(this.displayedMembershipColumns);
      // this.dst.clearSearch();
      await this.getMembershipData();
    }
  }

  private async getProductData(): Promise<void> {
    const busy = this.busyService.beginBusy();
    try {
      this.orchestration.abortCall();
      const parameters = this.getCollectionLoadParamaters(this.productNavigationState);
      let data = await this.productApi.get(parameters);

      if (data) {
        this.productDstSettings = {
          dataSource: data,
          displayedColumns: this.displayedProductColumns,
          entitySchema: this.productApi.entitySchema,
          navigationState: this.productNavigationState,
        };
        this.orchestration.dstSettingsReferenceUserProducts = this.productDstSettings;
        this.orchestration.preselectBySource(SelectedProductSource.ReferenceUserProducts, this.productDst);
      }
    } finally {
      busy.endBusy();
    }
  }

  private async getMembershipData(): Promise<void> {
    const busy = this.busyService.beginBusy();

    try {
      this.orchestration.abortCall();
      const parameters = this.getCollectionLoadParamaters(this.membershipNavigationState);
      let data = await this.membershipApi.getPeerGroupMemberships(parameters, { signal: this.orchestration.abortController.signal });

      if (data) {
        this.membershipDstSettings = {
          dataSource: data,
          displayedColumns: this.displayedMembershipColumns,
          entitySchema: this.membershipApi.PortalItshopPeergroupMembershipsSchema,
          navigationState: this.membershipNavigationState,
        };

        this.orchestration.dstSettingsReferenceUserOrgs = this.membershipDstSettings;
        this.orchestration.preselectBySource(SelectedProductSource.ReferenceUserOrgs, this.membershipDst);
      }
    } finally {
      busy.endBusy();
    }
  }

  private getCollectionLoadParamaters(
    navigationState: CollectionLoadParameters | ServiceItemParameters
  ): CollectionLoadParameters | ServiceItemParameters {
    return {
      ...navigationState,
      UID_Person: this.orchestration.recipients ? MultiValue.FromString(this.orchestration.recipients.value).GetValues().join(',') : undefined,
      UID_PersonReference: this.orchestration.referenceUser?.DataValue,
    };
  }
}
