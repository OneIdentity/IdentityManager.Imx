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

import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { ImageSelectorDialogParameter } from './image-selector-dialog-parameter.interface';
import { Base64ImageService, ClassloggerService, FileSelectorService } from 'qbm';

/**
 * A dialog to select an icon from a predefined list or upload an own one.
 */
@Component({
  selector: 'imx-image-selector-dialog',
  templateUrl: './image-selector-dialog.component.html',
  styleUrls: ['./image-selector-dialog.component.scss']
})
export class ImageSelectorDialogComponent implements OnDestroy {
  public get imageIsSelected(): boolean { return this.selectedIconName == null; }

  public imageUrl: string;
  public fileFormatError = false;

  public readonly iconNames: string[] = [];
  public readonly title: string;

  private selectedIconName: string;

  private readonly icons: { [name: string]: string; };
  private readonly subscriptions: Subscription[] = [];

  constructor(
    public dialogRef: MatDialogRef<ImageSelectorDialogComponent>,
    public readonly imageHandler: Base64ImageService,
    private logger: ClassloggerService,
    @Inject(MAT_DIALOG_DATA) data: ImageSelectorDialogParameter,
    private readonly fileSelector: FileSelectorService
  ) {
    this.subscriptions.push(
      this.fileSelector.fileFormatError.subscribe(() => this.fileFormatError = true),
      this.fileSelector.fileSelected.subscribe(imageUrl => this.selectImage(imageUrl))
    );

    this.title = data.title;
    this.icons = data.icons;

    Object.keys(data.icons).forEach(iconName =>
      this.iconNames.push(iconName)
    );

    if (data.imageUrl) {
      this.logger.debug(this, 'show and select actual assigned icon');
      this.selectImage(data.imageUrl);
    } else {
      this.logger.debug(this, 'initially select the default icon');
      this.selectIcon(data.defaultIcon);
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public onSave(): void {
    this.dialogRef.close({ file: this.getIconUrl() });
  }

  public iconIsSelected(name: string): boolean {
    return name === this.selectedIconName;
  }

  public selectImage(newImageUrl?: string): void {
    if (newImageUrl) {
      this.imageUrl = newImageUrl;
    }

    this.selectedIconName = undefined;
  }

  public selectIcon(name: string): void {
    this.selectedIconName = name;
  }

  public emitFiles(files: FileList): void {
    this.fileSelector.emitFiles(files, 'image/png');
  }

  public resetFileFormatErrorState(): void {
    this.fileFormatError = false;
  }

  private getIconUrl(): SafeUrl {
    if (this.selectedIconName) {
      return this.icons[this.selectedIconName];
    }

    return this.imageUrl;
  }
}
