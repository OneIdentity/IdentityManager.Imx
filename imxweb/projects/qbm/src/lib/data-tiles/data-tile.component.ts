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

import { Component, Input, EventEmitter, Output, TemplateRef, ViewChild, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatMenuTrigger } from '@angular/material/menu';

import { TypedEntity, IClientProperty } from 'imx-qbm-dbts';

import { DataTileBadge } from '../data-source-toolbar/data-tile-badge.interface';
import { DataTileMenuItem } from './data-tile-menu-item.interface';
import { Base64ImageService } from '../images/base64-image.service';
import { SafeUrl } from '@angular/platform-browser';
import { DataSourceItemStatus } from '../data-source-toolbar/data-source-item-status.interface';

/**
 * A single tile component used internally by the tiles components.
 *
 */
@Component({
  selector: 'imx-data-tile',
  templateUrl: './data-tile.component.html',
  styleUrls: ['./data-tile.component.scss']
})
export class DataTileComponent implements OnInit {
  /**
   * If present the badges will be shown in the upper right corner. Can be used e.g. to show different states.
   */
  public get badges(): DataTileBadge[] {
    return this.status?.getBadges ?
      this.status.getBadges(this.typedEntity) : undefined;
  }

  public get enabled(): boolean {
    return this.status?.enabled ?
      this.status.enabled(this.typedEntity) : true;
  }

  public get hasImage(): boolean {
    return (this.image || this.status?.getImagePath || this.fallbackIcon) ? true : false;
  }

  public get filteredActions(): DataTileMenuItem[] {
    return this.enabled ? this.actions : this.actions.filter(elem => elem.useOnDisabledTile);
  }

  public isLoadingImage: boolean;

  public imageUrl: SafeUrl;

  /**
   * The typed entity, that serves as the datasource.
   */
  @Input() public typedEntity: TypedEntity;

  /**
   * Indicates, if the tile is selected.
   */
  @Input() public isSelected = false;

  /**
   * Indicates, if the tile is selectable.
   */
  @Input() public isSelectable = false;

  /**
   * A custom content template that will be shown at the bottom area of the tile.
   */
  @Input() public contentTemplate: TemplateRef<any>;

  /**
   * The property of the typed entity that will be used as the title of the tile.
   */
  @Input() public titleObject: IClientProperty;

  /**
   * A list of properties, that should be displayed as an additional subtitle
   */
  @Input() public additionalSubtitleObjects: IClientProperty[] = [];


  /**
   * The property of the typed entity that will be used as the subtitle of the tile.
   */
  @Input() public subtitleObject: IClientProperty;

  /**
   * If present the image will be shown in the upper left corner.
   * If selection is enabled the selection button will be hiddem.
   */
  @Input() public image: IClientProperty;

  /**
   * The icon will be shown if the image is not set or not available.
   */
  @Input() public icon: string;

  /**
   * If the image property is set, but does not contain a valid image, the fallbackIcon will be used.
   */
  @Input() public fallbackIcon: string;

  /**
   * List of action names.
   * The list will be transformed into a clickable menu.
   */
  @Input() public actions: DataTileMenuItem[];

  /**
  * The width of the tile.
  */
  @Input() public width = '340px';

  /**
  * The height of the tile.
  */
  @Input() public height = '140px';

  @Input() public useActionMenu = true;

  /**
  * Status of this item. If the property enabled is true, the item is selectable.
  */
  @Input() public status: DataSourceItemStatus = {
    enabled: __ => true
  };

  /**
   * Event will fire, when a menu item is clicked.
   * Emmits the action.
   */
  @Output() public actionSelected = new EventEmitter<DataTileMenuItem>();

  /**
   * Event, that will fire, if the selection state changes.
   */
  @Output() public selectionChanged = new EventEmitter<TypedEntity>();

  //When tile is unselected and if the below event exists on the consumer this event will be emitted.
  @Output() public selected = new EventEmitter();

  // TODO: Check Upgrade
  @Output() public badgeClicked = new EventEmitter<{ entity: TypedEntity, badge: DataTileBadge }>();

  /**
   * A icon button that indicates if the tile is selected.
   * @ignore Used internally in components template.
   */
  @ViewChild('selectionButton') public selectionButton: MatButton;

  /**
   * Trigger for opening/closing the corresponding menu.
   * @ignore Used internally in components template.
   */
  @ViewChild(MatMenuTrigger) public menuTrigger: MatMenuTrigger;

  constructor(private readonly base64ImageService: Base64ImageService) { }

  public async ngOnInit(): Promise<void> {
    if (this.status?.getImagePath) {
      this.isLoadingImage = true;
      this.imageUrl = await this.status.getImagePath(this.typedEntity);
      this.isLoadingImage  = false;      
    } else if (this.image?.ColumnName) {
      this.imageUrl = this.base64ImageService.addBase64Prefix(
        this.typedEntity.GetEntity().GetColumn(this.image.ColumnName).GetValue()
      );
    }
  }

  /**
   * Used by the template to show the title or subtitle.
   * @ignore Used internally in components template.
   */
  public getTitleDisplayValue(colName: string): string {
    return this.typedEntity.GetEntity().GetColumn(colName).GetDisplayValue();
  }


  public getAdditionalColumnText(): string {
    return this.additionalSubtitleObjects.map(elem =>
      this.typedEntity.GetEntity().GetColumn(elem.ColumnName).GetDisplayValue()).join('; ');
  }

  public getDefaultTypeNameImage() {
    return `imx-table-${this.typedEntity.GetEntity().TypeName}-large`;
  }

  /**
   * Toggles if the tile is selected or not and emits the tiles datasource.
   * @ignore Used internally in components template.
   */
  public toggleSelection(): void {
    if (!this.enabled) {
      return;
    }

    if (this.isSelectable) {
      this.isSelected = !this.isSelected;
      this.selectionChanged.emit(this.typedEntity);
      //tile selection
      if(!this.isSelected){
        this.selected.emit(this.isSelected);
      }
    }
  }

  public onBadgeClick(badge: DataTileBadge): void {
    this.badgeClicked.emit({ entity: this.typedEntity, badge: badge });
  }

  /**
   * Opens/Closes the menu programmatically and stopps propagation of the event.
   * Otherwise the tile would be selected/deselcted as a sideeffect.
   * @ignore Used internally in components template.
   */
  public menuClicked(event: MouseEvent): void {
    this.menuTrigger.toggleMenu();
    event.stopImmediatePropagation();
  }

  /**
   * Emits the corresponding action and stops propagation of the event.
   * Otherwise the tile would be selected/deselected as a sideeffect.
   * @ignore Used internally in components template.
   */
  public menuItemClicked(menuItem: DataTileMenuItem, event?: MouseEvent): void {
    event?.stopImmediatePropagation();
    menuItem.typedEntity = this.typedEntity;
    this.actionSelected.emit(menuItem);
  }
}
