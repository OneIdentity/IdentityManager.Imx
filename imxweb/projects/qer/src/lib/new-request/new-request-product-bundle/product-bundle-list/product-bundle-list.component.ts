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

import { animate, animateChild, group, query, state, style, transition, trigger } from '@angular/animations';
import { AfterContentInit, AfterViewInit, Component, EventEmitter, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { isEqual } from 'lodash';
import { PortalItshopPatternItem, PortalItshopPatternRequestable, PortalShopServiceitems } from 'imx-api-qer';
import {
  CollectionLoadParameters,
  DisplayColumns,
  EntitySchema,
  ExtendedTypedEntityCollection,
  IClientProperty,
  IWriteValue,
  MultiValue,
  ValType,
} from 'imx-qbm-dbts';
import { BusyService, DataSourceToolbarComponent, DataSourceToolbarSettings, SettingsService } from 'qbm';
import { Subscription } from 'rxjs';
import { PatternItemListFilterType } from '../../../pattern-item-list/pattern-item-list-filter-type.enum';
import { PatternItemService } from '../../../pattern-item-list/pattern-item.service';
import { NewRequestOrchestrationService } from '../../new-request-orchestration.service';
import { NewRequestTabModel } from '../../new-request-tab/new-request-tab-model';
import {
  GetSelectedProductType,
  SelectedProductItem,
  SelectedProductSource,
} from '../../new-request-selected-products/selected-product-item.interface';
import { NewRequestSelectionService } from '../../new-request-selection.service';

@Component({
  selector: 'imx-product-bundle-list',
  templateUrl: './product-bundle-list.component.html',
  styleUrls: ['./product-bundle-list.component.scss'],
  animations: [
    trigger('expandSearch', [
      state(
        'closed',
        style({
          width: '0px',
          visibility: 'hidden',
        })
      ),
      state(
        'opened',
        style({
          width: '320px',
          visibility: 'visible',
        }),
        { params: { width: '*' } }
      ),
      state(
        'hidden',
        style({
          width: 0,
          visibility: 'hidden',
        })
      ),
      transition('* <=> *', [group([query('@fadeIcon', animateChild(), { optional: true }), animate('400ms ease')])]),
    ]),
    trigger('fadeIcon', [
      state(
        'opened',
        style({
          opacity: '0',
          width: '0px',
          visibility: 'hidden',
        })
      ),
      state(
        'closed',
        style({
          opacity: '1',
          width: '40px',
          visibility: 'visible',
        })
      ),
      state(
        'hidden',
        style({
          width: 0,
          visibility: 'hidden',
        })
      ),
      transition('* <=> *', animate('400ms ease')),
    ]),
  ],
})
export class ProductBundleListComponent implements AfterViewInit, AfterContentInit, OnChanges, OnDestroy {
  //#region Private
  private selectedProductBundles: any[] = [];
  private navigationState: CollectionLoadParameters;
  private subscriptions: Subscription[] = [];
  private searchEnabled = false;
  private keywords: string;
  private recipients: IWriteValue<string>;
  private viewReady = false;
  //#endregion

  //#region Public
  // Output() public selectionChanged = new EventEmitter<PortalItshopPatternRequestable[]>();
  @ViewChild(DataSourceToolbarComponent) public readonly dst: DataSourceToolbarComponent;
  public get searchState(): string {
    return this.viewReady ? (this.searchEnabled ? 'opened' : 'closed') : 'hidden';
  }
  public dstSettings: DataSourceToolbarSettings;
  public filterType: PatternItemListFilterType = PatternItemListFilterType.All;
  public readonly entitySchema: EntitySchema;
  public DisplayColumns = DisplayColumns;
  public displayedColumns: IClientProperty[];
  public selectedProductCandidates: SelectedProductItem[];
  public isLoading = false;
  public width = '600px';
  public readonly busyService = new BusyService();
  //#endregion

  constructor(
    private readonly orchestration: NewRequestOrchestrationService,
    private readonly patternItemService: PatternItemService,
    public readonly selectionService: NewRequestSelectionService,
    settingsService: SettingsService
  ) {
    this.orchestration.productBundle = null;
    this.navigationState = { PageSize: settingsService.DefaultPageSize, StartIndex: 0 };
    this.entitySchema = patternItemService.PortalShopPatternRequestableSchema;
    this.displayedColumns = [
      this.entitySchema.Columns.Ident_ShoppingCartPattern,
      {
        ColumnName: 'type',
        Type: ValType.String,
      },
      // {
      //   ColumnName: 'button',
      //   Type: ValType.String,
      // },
    ];

    this.subscriptions.push(this.orchestration.recipients$.subscribe((recipients: IWriteValue<string>) => (this.recipients = recipients)));

    // CHECK Do we need this?
    // this.subscriptions.push(
    //   this.orchestration.selectedProductCandidates$.subscribe((productCandidates: any[]) => (this.selectedProductCandidates = productCandidates))
    // );
    // this.subscriptions.push(this.orchestration.productCandidatesAdded$.subscribe((added: boolean) => {
    //   if (!added) {
    //     return;
    //   }

    //   this.dst?.selection?.clear();

    // }))
  }

  public ngAfterContentInit(): void {
    this.viewReady = true;
  }

  public async ngAfterViewInit(): Promise<void> {
    this.navigationState = { StartIndex: 0 };
    if (this.dstSettings) {
      this.dstSettings.displayedColumns = this.displayedColumns;
    }

    this.keywords ? await this.onSearch(this.keywords) : await this.getData();
  }

  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (
      (changes.referenceUserUid && !changes.referenceUserUid.firstChange) ||
      (changes.uidPersonPeerGroup && !changes.uidPersonPeerGroup.firstChange)
    ) {
      return this.getData({ StartIndex: 0 });
    }
  }

  public ngOnDestroy(): void {
    if (this.dst && this.dst.numOfSelectableItems > 0) {
      this.dst.clearSelection();
    }
  }

  public async onSearch(keywords: string): Promise<void> {
    if (keywords === '') {
      this.searchEnabled = false;
    }
    this.navigationState = {
      ...this.navigationState,
      StartIndex: 0,
      search: keywords,
    };
    return this.getData();
  }

  public onHighlightedEntityChanged(selectedBundle: PortalItshopPatternRequestable): void {
    this.orchestration.productBundle = selectedBundle;
  }

  public async onSelectionChanged(bundles: PortalItshopPatternRequestable[]): Promise<void> {
    if (bundles?.length === 0) {
      this.selectionService.addProducts([], SelectedProductSource.ProductBundles);
    } else {
      // get all pattern items for all bundles
      for (const bundle of bundles) {
        const items = await this.patternItemService.getPatternItemList(bundle);
        if (items && items.Data) {
          this.selectionService.addProducts(items.Data, SelectedProductSource.ProductBundles, true, bundle);
        }
      }
    }
  }

  public async onSelectAll(bundle: PortalItshopPatternRequestable): Promise<void> {
    const items = await this.patternItemService.getPatternItemList(bundle);
    if (items && items.Data) {
      this.selectionService.addProducts(items.Data, SelectedProductSource.ProductBundles, true, bundle);
    }
  }

  public async getData(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }

    const busy = this.busyService.beginBusy();

    try {
      this.orchestration.abortCall();
      const data = await this.patternItemService.get(
        {
          ...this.navigationState,
          UID_Person: this.recipients ? MultiValue.FromString(this.recipients.value).GetValues().join(',') : undefined,
        },
        { signal: this.orchestration.abortController.signal }
      );
      if (data) {
        this.dstSettings = {
          dataSource: this.applyFilter(data, this.filterType),
          displayedColumns: this.displayedColumns,
          entitySchema: this.entitySchema,
          navigationState: this.navigationState,
        };
      } else {
        this.dstSettings = undefined;
      }
    } finally {
      busy.endBusy();
    }
  }

  public applyFilter(
    data: ExtendedTypedEntityCollection<PortalItshopPatternRequestable, unknown>,
    filterType: PatternItemListFilterType
  ): ExtendedTypedEntityCollection<PortalItshopPatternRequestable, unknown> {
    switch (filterType) {
      case PatternItemListFilterType.All:
        break;
      case PatternItemListFilterType.Public:
        const publicPatterns = data.Data.filter((item) => item.IsPublicPattern.value);
        data.Data = publicPatterns;
        data.totalCount = publicPatterns.length;
        break;
      case PatternItemListFilterType.Private:
        const privatePatterns = data.Data.filter((item) => !item.IsPublicPattern.value);
        data.Data = privatePatterns;
        data.totalCount = privatePatterns.length;
        break;
    }
    return data;
  }

  public async onFilterChanged(): Promise<void> {
    this.getData();
  }

  public enableSearch(): void {
    this.searchEnabled = true;
  }

  public selectAll(): void {
    this.dst?.selectAllOnPage();
  }

  public deselectAll(): void {
    this.dst?.clearSelection();
  }

  public resetKeywords(): void {
    this.keywords = '';
    this.dst.keywords = '';
    this.dst.searchControl.setValue('');
  }

  /**
   * Load all pattern items for given bundles.
   * @param bundles
   */
  private async getPatternItemsOfBundles(bundles: PortalItshopPatternRequestable[]): Promise<PortalItshopPatternItem[]> {
    const patternItems: PortalItshopPatternItem[] = [];
    for (const bundle of bundles) {
      const items = await this.patternItemService.getPatternItemList(bundle);
      if (items && items.Data) {
        patternItems.push(...items.Data);
      }
    }
    return patternItems;
  }
}
