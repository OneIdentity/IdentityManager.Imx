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

import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import {
  buildAdditionalElementsString,
  BusyService,
  ClientPropertyForTableColumns,
  DataSourceToolbarComponent,
  DataSourceToolbarSettings,
  DataTileBadge,
  DataTileMenuItem,
  MessageDialogComponent,
  SettingsService,
} from 'qbm';
import {
  CollectionLoadParameters,
  DisplayColumns,
  IClientProperty,
  IWriteValue,
  ValType,
  MultiValue,
  EntitySchema,
  DataModel,
} from 'imx-qbm-dbts';
import { PortalShopCategories, PortalShopServiceitems } from 'imx-api-qer';

import { ServiceItemsService } from '../service-items.service';
import { ServiceItemInfoComponent } from '../service-item-info/service-item-info.component';
import { ImageService } from '../../itshop/image.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'imx-serviceitem-list',
  templateUrl: './serviceitem-list.component.html',
  styleUrls: ['./serviceitem-list.component.scss'],
})
export class ServiceitemListComponent implements AfterViewInit, OnChanges, OnDestroy, OnInit {
  @ViewChild('dst') public dstComponent: DataSourceToolbarComponent;

  @Input() public selectedServiceCategory: PortalShopCategories;
  @Input() public keywords: string;
  @Input() public recipients: IWriteValue<string>;
  @Input() public referenceUserUid: string;
  @Input() public uidPersonPeerGroup: string;
  @Input() public dataSourceView = { selected: 'cardlist' };
  @Input() public itemActions: DataTileMenuItem[];  
  @Input() public patternItemsMode: boolean = false;

  @Output() public selectionChanged = new EventEmitter<PortalShopServiceitems[]>();
  @Output() public handleAction = new EventEmitter<{ item: PortalShopServiceitems, name: string }>();
  @Output() public categoryRemoved = new EventEmitter<PortalShopCategories>();
  @Output() public readonly openCategoryTree = new EventEmitter<void>();

  public dstSettings: DataSourceToolbarSettings;
  public readonly entitySchema: EntitySchema;
  public DisplayColumns = DisplayColumns;
  public displayedColumns: ClientPropertyForTableColumns[];

  public includeChildCategories: boolean;
  public noDataText = '#LDS#No data';
  public readonly status = {
    getBadges: (prod: PortalShopServiceitems): DataTileBadge[] => this.getBadges(prod),
    enabled: (prod: PortalShopServiceitems): boolean => {
      return this.patternItemsMode || prod.IsRequestable.value;
    },
    getImagePath: async (prod: PortalShopServiceitems): Promise<string> => this.image.getPath(prod),
  };
  public peerGroupSize: number;
  
  public busyService = new BusyService();

  public get options(): string[] {
    return this.uidPersonPeerGroup ?? '' !== '' ? ['search', 'filter', 'settings'] : ['search', 'filter', 'settings', 'selectedViewGroup'];
  }

  @ViewChild(DataSourceToolbarComponent) private readonly dst: DataSourceToolbarComponent;

  private readonly badgeInfoText = '#LDS#Info';
  private readonly badgeNotRequestableText = '#LDS#Not requestable';
  private navigationState: CollectionLoadParameters;
  private dataModel: DataModel;

  constructor(
    private readonly serviceItemsProvider: ServiceItemsService,
    private readonly dialog: MatDialog,
    private readonly image: ImageService,
    private readonly translate: TranslateService,
    settingsService: SettingsService,
  ) {
    this.navigationState = { PageSize: settingsService.DefaultPageSize, StartIndex: 0 };
    this.entitySchema = serviceItemsProvider.PortalShopServiceItemsSchema;
    this.displayedColumns = [
      this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      {
        ColumnName: 'actions',
        Type: ValType.String,
        afterAdditionals: true,
        untranslatedDisplay: '#LDS#Actions'
      },
    ];
  }

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      this.dataModel = await this.serviceItemsProvider.getDataModel();
    } finally {
      isBusy.endBusy();
    }
  }

  public async ngAfterViewInit(): Promise<void> {
    this.keywords ? await this.onSearch(this.keywords) : await this.getData();
  }

  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (
      (changes.selectedServiceCategory && !changes.selectedServiceCategory.firstChange) ||
      (changes.referenceUserUid && !changes.referenceUserUid.firstChange) ||
      (changes.uidPersonPeerGroup && !changes.uidPersonPeerGroup.firstChange)
    ) {
      this.dst?.clearSelection();
      return this.getData({ StartIndex: 0 });
    }
  }

  public ngOnDestroy(): void {
    if (this.dst && this.dst.numOfSelectedItems > 0) {
      this.dst.clearSelection();
      this.selectionChanged.emit([]);
    }
  }

  public async onSearch(keywords: string): Promise<void> {
    const navigationState = {
      PageSize: this.navigationState.PageSize,
      StartIndex: 0,
      search: keywords,
    };

    return this.getData(navigationState);
  }

  public onSelectionChanged(items: PortalShopServiceitems[]): void {
    this.selectionChanged.emit(items);
  }

  public onBadgeClicked(item: any): void {
    const dialogRef = this.dialog.open(ServiceItemInfoComponent, {
      data: { prod: item.entity, recipients: this.recipients },
    });
  }

  public async getData(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }

    const isBusy = this.busyService.beginBusy();
    try {
      const data = await this.serviceItemsProvider.get({
        ...this.navigationState,
        UID_Person: this.recipients ? MultiValue.FromString(this.recipients.value).GetValues().join(',') : undefined,
        UID_PersonReference: this.referenceUserUid,
        UID_PersonPeerGroup: this.uidPersonPeerGroup,
        IncludeChildCategories: this.includeChildCategories,
        UID_AccProductGroup: this.selectedServiceCategory ? this.selectedServiceCategory.UID_AccProductGroup.value : undefined,
      });

      if (data) {
        this.dstSettings = {
          dataSource: data,
          displayedColumns: this.displayedColumns,
          entitySchema: this.entitySchema,
          navigationState: this.navigationState,
          dataModel: this.dataModel
        };

        this.peerGroupSize = data.extendedData?.PeerGroupSize;

        if (this.peerGroupSize === 0) {
          this.noDataText = '#LDS#Heading Peer Group Is Empty';
          this.dialog.open(MessageDialogComponent, {
            data: {
              ShowOk: true,
              Title: await this.translate.get(this.noDataText).toPromise(),
              Message: await this.translate.get('#LDS#You cannot view products of your peer group. Your peer group is empty.').toPromise(),
            },
            panelClass: 'imx-messageDialog',
          });
        } else {
          this.noDataText = '#LDS#No data';
        }
      } else {
        this.dstSettings = undefined;
      }
    } finally {
      isBusy.endBusy();
    }
  }

  public itemSelectable(event: any): void {
    const serviceItem: PortalShopServiceitems = event.item;
    event.selectableRows.push(serviceItem.IsRequestable.value);
  }

  public isValueContains(input: string, values: string | string[]): boolean {
    const inputValues = MultiValue.FromString(input).GetValues();
    if (typeof values === 'string') {
      return inputValues.includes(values);
    }
    return inputValues.findIndex((i) => values.includes(i)) !== -1;
  }

  public getSubtitle(entity: PortalShopServiceitems, additionalProperties: IClientProperty[]): string {
    const properties = [this.entitySchema.Columns.ServiceCategoryFullPath].concat(additionalProperties);
    return buildAdditionalElementsString(entity.GetEntity(), properties);
  }

  public onViewSelectionChanged(view: string): void {
    this.dataSourceView.selected = view;
  }

  public emitAction(item: DataTileMenuItem, serviceItem?: PortalShopServiceitems): void {
    this.handleAction.emit({ item: serviceItem ?? item.typedEntity as PortalShopServiceitems, name: item.name });
  }

  public async onRemoveChip(): Promise<void> {
    this.selectedServiceCategory = null;
    this.categoryRemoved.emit(this.selectedServiceCategory);
    await this.getData();
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

  private getBadges(prod: PortalShopServiceitems): DataTileBadge[] {
    if (this.patternItemsMode) {
      return [];
    }
    const result: DataTileBadge[] = [];
    if (prod.IsRequestable.value === false) {
      result.push({
        content: this.badgeNotRequestableText,
        color: 'red',
      });
    }

    if (
      prod.IsRequestable.value &&
      (this.isValueContains(prod.OrderableStatus.value, ['PERSONHASOBJECT', 'PERSONHASASSIGNMENTORDER']) ||
        this.isValueContains(prod.OrderableStatus.value, 'ASSIGNED') ||
        this.isValueContains(prod.OrderableStatus.value, 'ORDER') ||
        this.isValueContains(prod.OrderableStatus.value, 'NOTORDERABLE') ||
        this.isValueContains(prod.OrderableStatus.value, 'CART'))
    ) {
      result.push({
        content: this.badgeInfoText,
        color: 'orange',
      });
    }

    return result;
  }
}
