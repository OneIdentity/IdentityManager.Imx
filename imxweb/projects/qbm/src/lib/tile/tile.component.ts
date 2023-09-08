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

import { Component, EventEmitter, Input, Output, ContentChild, TemplateRef, ElementRef } from '@angular/core';

@Component({
  templateUrl: './tile.component.html',
  selector: 'imx-tile',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent {

  @Input() public caption: string;
  @Input() public subtitle: string;
  @Input() public actionText = '#LDS#View';
  @Input() public value: string;
  @Input() public imageType: 'Url' | 'IconFont' | 'EuiIcon' = 'Url';
  @Input() public identifier: string;
  @Input() public image: string;
  @Input() public size: 'Square' | 'Tile' | 'Addon-Tile' | 'Overview' | 'Dashboard' | 'Large-Overview' | 'Custom-Tile' = 'Tile';
  @Input() public highlight: boolean;
  @Input() public contentType: 'Text' | 'Image' | 'Container';
  @Input() public hideActionButton: boolean;
  @Input() public loadingState: boolean = false;

  @Output() public actionClick: EventEmitter<any> = new EventEmitter();

  @ContentChild('CaptionTemplate', { static: true }) public captionTemplate: TemplateRef<ElementRef>;
  @ContentChild('ValueTemplate', { static: true }) public valueTemplate: TemplateRef<ElementRef>;
  @ContentChild('CustomTemplate', { static: true }) public customTemplate: TemplateRef<ElementRef>;

  public mouseOvered: boolean;

  public emitOnClick(): void {
    this.actionClick.emit({});
  }

  public isDashboard(): boolean {
    return this.size === 'Dashboard';
  }

  public isLargeOverview(): boolean {
    return this.size === 'Large-Overview';
  }

  public isCustomTile(): boolean {
    return this.size === 'Custom-Tile';
  }

  public isDefault(): boolean {
    return !this.isDashboard() && !this.isLargeOverview() && !this.isCustomTile();
  }

  public sectionClass(): string {
    const size = this.size !== 'Tile' ? ` ${this.size.toLowerCase()}` : '';
    const highlighted = this.highlight ? ' highlighted' : '';
    return 'imx-generic-tile' + size + highlighted;
  }

  public showImageInHeader(): boolean {
    return this.image
      && this.contentType !== 'Image';
  }

  public showImageAsValue(): boolean {
    return this.image && this.contentType === 'Image';
  }

  public showImageAsIconFont(): boolean {
    return this.imageType === 'IconFont' || this.imageType === 'EuiIcon';
  }

  public styleImage(): string {
    let style: string;
    if (this.showImageAsValue) {
      style = 'background-position: center; ';
    }
    return style + `background-repeat: no-repeat; background-image: url('${this.urlImage()}');`;
  }

  public urlImage(): string {
    let firstPart: string;
    if (this.imageType === 'Url') {
      firstPart = this.image;
    }

    let size: string;
    if (this.showImageAsValue) {
      size = '&size=Large';
    } else if (this.showImageInHeader) {
      size = '&size=big';
    }


    return firstPart + encodeURI(this.image) + size;
  }

}
