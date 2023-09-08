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

import { Component, Input, EventEmitter, Output, TemplateRef, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { SelectionChange } from '@angular/cdk/collections';
import { Subscription } from 'rxjs';

import { DataSourceToolbarComponent } from '../data-source-toolbar/data-source-toolbar.component';
import { TypedEntity, IClientProperty } from 'imx-qbm-dbts';
import { DataTileMenuItem } from './data-tile-menu-item.interface';
import { DataTileBadge } from '../data-source-toolbar/data-tile-badge.interface';

/**
 * A list component containing {@link SingleTileComponent| tiles}.
 * Collaborates with a DST (datasource toolbar).
 */
@Component({
  selector: 'imx-data-tiles',
  templateUrl: './data-tiles.component.html',
  styleUrls: ['./data-tiles.component.scss'],
})
export class DataTilesComponent implements OnChanges, OnDestroy {
  /**
   * The DST (Datasource toolbar)
   */
  @Input() public dst: DataSourceToolbarComponent;

  /**
   * Indicates if tiles are selectable.
   */
  @Input() public selectable = false;

  /**
   * Indicates if multiselect is enabled.
   * If selectable is set to false, this property has no effect.
   */
  @Input() public multiSelect = true;

  /**
   * Custom template of tiles
   */
  @Input() public contentTemplate: TemplateRef<any>;

  /**
   * The title object of a tile.
   */
  @Input() public titleObject: IClientProperty;

  /**
   * The subtitle object of a tile.
   */
  @Input() public subtitleObject: IClientProperty;

  public additionalSubtitleObjects: IClientProperty[] = [];

  /**
   * The icon will be shown if the image is not set or not available.
   */
  @Input() public icon: string;

  /**
   * List of action names.
   * The list will be transformed into a menu and attached to each tile.
   */
  @Input() public actions: DataTileMenuItem[];

  /**
   * Tile Image. If present and selection is enabled, the selection icons will not be shown.
   */
  @Input() public image: IClientProperty;

  @Input() public selectedEntity: TypedEntity;

  /**
   * If the image property of a tile is set, but does not contain a valid image, the fallbackIcon will be used.
   */
  @Input() public fallbackIcon: string;

  /**
   * If present this text would be shown, if no items are found.  .
   */
  @Input() public noItemsFoundText = '#LDS#No data';

  /**
   * If present this text would be shown, if no items are found.  .
   */
  @Input() public noItemsMatchText = '#LDS#There is no data matching your search.';

  /**
   * This icon will be displayed when there is no data on the datasource (and a search is not applied)
   * Defaults to the 'table' icon when not supplied
   */
  @Input() public noDataIcon = 'table';

  /**
   * This icon will be displayed along with the 'noMatchingDataTranslationKey' text when a search or filter
   * is applied but there is no data as a result
   * Defaults to the 'search' icon when not supplied
   */
  @Input() public noMatchingDataIcon = 'search';

  /**
   * The width of a tile.
   */
  @Input() public width = '340px';

  /**
   * The height of a tile.
   */
  @Input() public height: '140px';

  @Input() public useActionMenu = true;

  /**
   * Event will fire, when a menu item in a tile is clicked.
   * Emmits the name of the actions.
   */
  @Output() public actionSelected = new EventEmitter<DataTileMenuItem>();

  /**
   * Event, that will fire when the selection has changed.
   */
  @Output() public selectionChanged = new EventEmitter<TypedEntity[]>();

  //When tile is unselected and if the below event exists on the consumer this event will be emitted.
  @Output() public selected = new EventEmitter();

  /**
   * Event, that will fire when the user clicks on the badge.
   */
  @Output() public badgeClicked = new EventEmitter<DataTileBadge>();

  /**
   * @ignore
   * internal handler for loading
   */
  public isLoading = true;

  /**
   * Keeps track of the selected item in single select mode
   */
  private selectedItem: TypedEntity;

  /**
   * @ignore
   * List of subscriptions.
   */
  private subscriptions: Subscription[] = [];

  constructor(private readonly changeDetector: ChangeDetectorRef){}

  /**
   * @ignore Used internally.
   *
   * Listens for changes of data table inputs e.g. checks it the datasource has changed.
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['dst'] && changes['dst'].currentValue) {
      this.subscriptions.push(
        this.dst.selectionChanged.subscribe((event: SelectionChange<TypedEntity>) => this.selectionChanged.emit(event.source.selected))
      );

      this.additionalSubtitleObjects = this.dst?.additionalListElements;

      if (this.dst.busyService) {
        this.subscriptions.push(this.dst.busyService.busyStateChanged.subscribe((value:boolean)=>{
          this.isLoading = value;
          this.changeDetector.detectChanges()
        }));
      }
      this.isLoading = this.dst?.busyService?.isBusy ?? false;

    }
  }

  /**
   * @ignore Used internally.
   * Unsubscribes all listeners.
   */
  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public isSelected(item: TypedEntity): boolean {
    if (this.multiSelect) {
      return this.dst.isChecked(item);
    }

    if (this.selectedEntity) {
      this.selectedItem = this.selectedEntity;
    }

    return this.selectedItem && this.selectedItem.GetEntity().GetKeys().join() === item.GetEntity().GetKeys().join();
  }

  /**
   * Fires when selection changes and toggles selection state.
   */
  public onSelectionChanged(item: TypedEntity): void {
    if (this.multiSelect) {
      this.dst.toggle(item);
    } else {
      this.selectedItem = item;
      this.selectionChanged.emit([item]);
    }
  }

  public onTileSelected(selected) {
    this.selected.emit(selected);
  }

  public onActionSelected(action: DataTileMenuItem): void {
    this.actionSelected.emit(action);
  }

  public clearSelection(): void {
    this.selectedItem = undefined;
    this.dst.clearSelection();
  }

  public selectAll(): void {
    this.dst.selectAllOnPage();
  }

  public onBadgeClicked(badge: DataTileBadge): void {
    this.badgeClicked.emit(badge);
  }
}
