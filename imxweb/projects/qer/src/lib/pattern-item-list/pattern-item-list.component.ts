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

import { OverlayRef } from '@angular/cdk/overlay';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';
import { PortalItshopPatternRequestable, PortalShopServiceitems } from 'imx-api-qer';
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
import {
  DataSourceToolbarComponent,
  DataSourceToolbarSettings,
  DataTileBadge,
  DataTileMenuItem,
  SettingsService,
} from 'qbm';
import { PatternItemListFilterType } from './pattern-item-list-filter-type.enum';
import { PatternItemService } from './pattern-item.service';

@Component({
  selector: 'imx-pattern-item-list',
  templateUrl: './pattern-item-list.component.html',
  styleUrls: ['./pattern-item-list.component.scss'],
})
export class PatternItemListComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('dst') public dstComponent: DataSourceToolbarComponent;

  @Input() public keywords: string;
  @Input() public recipients: IWriteValue<string>;
  @Input() public dataSourceView = { selected: 'cardlist' };
  @Input() public itemActions: DataTileMenuItem[];

  @Output() public handleAction = new EventEmitter<
    { name: string, serviceItems?: PortalShopServiceitems[], patternItem?: PortalItshopPatternRequestable }>();
  @Output() public selectionChanged = new EventEmitter<PortalItshopPatternRequestable[]>();

  public dstSettings: DataSourceToolbarSettings;
  public filterType: PatternItemListFilterType = PatternItemListFilterType.All;
  public readonly entitySchema: EntitySchema;
  public DisplayColumns = DisplayColumns;
  public displayedColumns: IClientProperty[];

  public filterTypes = [
    {
      type: PatternItemListFilterType.All,
      display: '#LDS#All request templates'
    },
    {
      type: PatternItemListFilterType.Public,
      display: '#LDS#Public request templates'
    },
    {
      type: PatternItemListFilterType.Private,
      display: '#LDS#Private request templates'
    }
  ];

  public badgeContent = {
    isPublic: '#LDS#Public request template',
    isPrivate: '#LDS#Private request template',
  };
  public readonly status = {
    getBadges: (prod: PortalItshopPatternRequestable): DataTileBadge[] => {
      const badge: DataTileBadge = {
        content: '',
        color: '',
      };
      if (prod.IsPublicPattern.value) {
        badge.content = this.badgeContent.isPublic;
        badge.color = 'blue';
      } else {
        badge.content = this.badgeContent.isPrivate;
        badge.color = 'orange';
      }
      return [badge];
    },
    enabled: () => {
      return true;
    },
  };

  public isLoading = false;
  private navigationState: CollectionLoadParameters;

  @ViewChild(DataSourceToolbarComponent) private readonly dst: DataSourceToolbarComponent;


  constructor(
    private readonly busyService: EuiLoadingService,
    private readonly patternItemService: PatternItemService,
    settingsService: SettingsService
  ) {
    this.navigationState = { PageSize: settingsService.DefaultPageSize, StartIndex: 0 };
    this.entitySchema = patternItemService.PortalShopPatternRequestableSchema;
    this.displayedColumns = [
      this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      {
        ColumnName: 'badges',
        Type: ValType.String
      },
      {
        ColumnName: 'actions',
        Type: ValType.String,
      },
    ];
  }

  public async ngAfterViewInit(): Promise<void> {
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
    if (this.dst && this.dstComponent.numOfSelectableItems > 0) {
      this.dst.clearSelection();
      this.selectionChanged.emit([]);
    }
  }

  public async onSearch(keywords: string): Promise<void> {
    const navigationState: CollectionLoadParameters = {
      PageSize: this.navigationState.PageSize,
      StartIndex: 0,
      search: keywords,
    };
    return this.getData(navigationState);
  }

  public onSelectionChanged(items: PortalItshopPatternRequestable[]): void {
    this.selectionChanged.emit(items);
  }

  public async getData(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }

    let overlayRef: OverlayRef;
    setTimeout(() => {
      overlayRef = this.busyService.show();
      this.isLoading = true;
    });

    try {
      const data = await this.patternItemService.get({
        ...this.navigationState,
        UID_Person: this.recipients ? MultiValue.FromString(this.recipients.value).GetValues().join(',') : undefined,
      });
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
      setTimeout(() => {
        this.busyService.hide(overlayRef);
        this.isLoading = false;
      });
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

  public itemSelectable(event: any): void {
    const patternRequestable: PortalItshopPatternRequestable = event.item;
    event.selectableRows.push(patternRequestable.IsPublicPattern.value);
  }

  public isValueContains(input: string, values: string | string[]): boolean {
    const inputValues = MultiValue.FromString(input).GetValues();
    if (typeof values === 'string') {
      return inputValues.includes(values);
    }
    return inputValues.findIndex((i) => values.includes(i)) !== -1;
  }

  public onViewSelectionChanged(view: string): void {
    this.dataSourceView.selected = view;
  }

  public async emitAction(item: DataTileMenuItem, patternRequestable?: PortalItshopPatternRequestable): Promise<void> {

    if (item.name === 'details') {
      let overlayRef: OverlayRef;
      setTimeout(() => {
        overlayRef = this.busyService.show();
      });

      try {
        const items = await this.patternItemService.getServiceItems(patternRequestable ?? item.typedEntity as PortalItshopPatternRequestable);
        this.handleAction.emit({ serviceItems: items, name: item.name });
      } finally {
        setTimeout(() => {
          this.busyService.hide(overlayRef);
        });
      }
    }
    if (item.name === 'addTemplateToCart') {
      this.handleAction.emit({ patternItem: patternRequestable ?? item.typedEntity as PortalItshopPatternRequestable, name: item.name });
    }
  }

  public selectAll(): void {
    this.dst?.selectAllOnPage();
  }

  public deselectAll(): void {
    this.dst?.clearSelection();
  }

  public resetKeywords(): void {
    this.keywords = '';
    this.dstComponent.keywords = '';
    this.dstComponent.searchControl.setValue('');
  }
}
