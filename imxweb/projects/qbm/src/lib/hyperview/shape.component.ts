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

import { Component, EventEmitter, Input, OnInit } from '@angular/core';

import { ShapeData } from 'imx-api-qbm';
import { ModelCssService } from '../model-css/model-css.service';
import { TableImageService } from '../table-image/table-image.service';
import { ShapeClickArgs } from './hyperview-types';

/**
 * The general shape component for an object.
 */
@Component({
  selector: 'imx-hyperview-shape',
  templateUrl: './shape.component.html',
  styleUrls: ['./shape.component.scss'],
})
export class ShapeComponent implements OnInit {
  @Input() public shape: ShapeData;
  @Input() public navigate = false;
  @Input() public selected: EventEmitter<ShapeClickArgs> = new EventEmitter();
  public imageClass: string;

  constructor(private readonly imageService: TableImageService, private readonly modelCssService: ModelCssService) {}

  public ngOnInit(): void {
    this.modelCssService.loadModelCss();

    this.imageClass = this.shape.ImageUid ? this.imageService.getCss(this.shape.ImageUid, true) : this.imageService.getDefaultCss(true);
  }

  public click(): void {
    if (this.navigate && !this.isShapeLayoutMiddle) {
      this.selected?.emit({ objectKey: this.shape.ObjectKey, caption: this.shape.Caption });
    }
  }

  public get ObjectCount(): number {
    return this.shape && this.shape.Elements ? this.shape.Elements.length : -1;
  }

  public get isShapeLayoutMiddle(): boolean {
    return this.shape?.LayoutType === 'MiddleCenter';
  }
}
