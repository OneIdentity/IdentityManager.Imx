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

import { Component, Input, EventEmitter, Output } from '@angular/core';

import { ShapeData, ShapeListEntry } from 'imx-api-qbm';
import { ShapeClickArgs } from './hyperview-types';

/**
 * A shape component that lists all {@link ShapeListEntry|elements}.
 */
@Component({
  selector: 'imx-hyperview-listshape',
  templateUrl: './listshape.component.html',
  styleUrls: ['./listshape.component.scss'],
})
export class ListShapeComponent {
  @Input() public shape: ShapeData;
  @Input() public selected: EventEmitter<ShapeClickArgs> = new EventEmitter();
  @Output() public changeShapeSize = new EventEmitter<void>();

  public isLinkEnabled() {
    return this.selected.observers.length > 0;
  }
  /**
   * Emit selection event for this {@link ShapeListEntry|element}.
   * @param elem the element the user clicked
   */
  public click(elem: ShapeListEntry): void {
    if (this.selected.observers.length > 0) {
      this.selected.emit({ objectKey: elem.ObjectKey, caption: this.shape.Caption });
    }
  }

  public onChangeContentSize(): void {
    this.changeShapeSize.emit();
  }
}
