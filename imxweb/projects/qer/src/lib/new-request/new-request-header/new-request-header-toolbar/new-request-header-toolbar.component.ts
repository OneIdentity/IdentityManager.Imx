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

import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';

import { PortalItshopPatternRequestable, PortalServicecategories } from 'imx-api-qer';
import { CollectionLoadParameters } from 'imx-qbm-dbts';

import { DataSourceToolbarComponent, DataSourceToolbarSettings } from 'qbm';
import { NewRequestOrchestrationService } from '../../new-request-orchestration.service';
import { ServiceItemParameters } from '../../new-request-product/service-item-parameters';
import { NewRequestTabModel } from '../../new-request-tab/new-request-tab-model';
import { NewRequestProductComponent } from '../../new-request-product/new-request-product.component';
import { SelectedProductSource } from '../../new-request-selected-products/selected-product-item.interface';

@Component({
  selector: 'imx-new-request-header-toolbar',
  templateUrl: './new-request-header-toolbar.component.html',
  styleUrls: ['./new-request-header-toolbar.component.scss'],
})
export class NewRequestHeaderToolbarComponent implements OnDestroy {

  //#region Private
  private subscriptions: Subscription[] = [];
  //#endregion

  //#region Public

  public dstSettings: DataSourceToolbarSettings;
  public searchApi: () => Observable<any>;
  public selectedCategory: PortalServicecategories;
  public showCatInfo = false;
  public searchBoxText = '#LDS#Search';
  public SelectedProductSource = SelectedProductSource;
  public selectedView: SelectedProductSource;
  public disableSearch = false;

  @ViewChild(DataSourceToolbarComponent) public dst: DataSourceToolbarComponent;
  //#endregion

  constructor(public readonly orchestration: NewRequestOrchestrationService) {
    this.subscriptions.push(
      this.orchestration.searchApi$.subscribe(searchApi => {
        this.searchApi = searchApi;
      })
    );

    this.subscriptions.push(this.orchestration.selectedCategory$.subscribe((category: PortalServicecategories) => {
      this.selectedCategory = category;
      this.updateSearchBoxText();
    }));

    this.subscriptions.push(this.orchestration.disableSearch$.subscribe((disableSearch: boolean) => {
      this.disableSearch = disableSearch;
    }));

    this.subscriptions.push(this.orchestration.selectedTab$.subscribe((selectedTab: NewRequestTabModel) => {
      selectedTab?.component === NewRequestProductComponent ? this.showCatInfo = true : this.showCatInfo = false;

      this.disableSearch = this.orchestration.disableSearch || selectedTab?.link === 'productBundles';

      this.updateSearchBoxText();
    }));

    this.subscriptions.push(
      this.orchestration.productBundle$.subscribe((productBundle: PortalItshopPatternRequestable) => {
        this.disableSearch = !productBundle;
      })
    );

    this.subscriptions.push(this.orchestration.selectedChip$.subscribe(() => {
      this.updateSearchBoxText();
    }));

    this.subscriptions.push(this.orchestration.selectedView$.subscribe((selectedView: SelectedProductSource) => {
      this.selectedView = selectedView;
    }));
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }


  public onNavigationChanged(newState?: CollectionLoadParameters | ServiceItemParameters): void {
    this.orchestration.navigationState = newState;
  }

  public onVisibility(visible: boolean) {
    if (visible) {
      this.orchestration.currentProductSource = { dst: this.dst, view: this.selectedView};
    }
  }

  private updateSearchBoxText() {
    if (this.orchestration.selectedTab?.link === 'allProducts') {
      if (this.orchestration.selectedCategory) {
        this.searchBoxText = '#LDS#Search for products in this service category';
      } else {
        this.searchBoxText = '#LDS#Search for products in all service categories';
      }
    }
    if (this.orchestration.selectedTab?.link === 'productsByPeerGroup') {
      this.searchBoxText = this.orchestration.selectedChip === 0
      ? '#LDS#Search for products in this peer group'
      : '#LDS#Search for organizational structures in this peer group';
    }
    if (this.orchestration.selectedTab?.link === 'productsByReferenceUser') {
      this.searchBoxText = this.orchestration.selectedChip === 0
      ? '#LDS#Search for products of this identity'
      : '#LDS#Search for organizational structures of this identity';
    }
    if (this.orchestration.selectedTab?.link === 'productBundles') {
      this.searchBoxText = '#LDS#Search for products in the selected product bundle';
    }
  }
}
