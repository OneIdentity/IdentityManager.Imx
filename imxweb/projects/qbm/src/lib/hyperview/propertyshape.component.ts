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
 * Copyright 2024 One Identity LLC.
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

import { Component, EventEmitter, Input } from '@angular/core';

import { ShapeData, ShapeProperty } from '@imx-modules/imx-api-qbm';
import { EntityColumnData } from '@imx-modules/imx-qbm-dbts';
import { ShapeClickArgs } from './hyperview-types';

/**
 * A shape component that lists all {@link ShapeProperties|properties} of an object.
 */
@Component({
  selector: 'imx-hyperview-propertyshape',
  templateUrl: './propertyshape.component.html',
  styleUrls: ['./propertyshape.component.scss'],
})
export class PropertyShapeComponent {
  @Input() public shape: ShapeData;

  @Input() public selected: EventEmitter<ShapeClickArgs> = new EventEmitter();

  public GetPropertyDisplayValue(property: EntityColumnData | undefined): string {
    return property?.DisplayValue != null ? property.DisplayValue : property?.Value ?? '';
  }

  /**
   * Emit selection event for this {@link ShapeProperty|element}.
   * @param shape the element the user clicked
   */
  public onClick(shape: ShapeProperty): void {
    if (this.isLinkEnabled() && !!shape.ObjectKey) {
      this.selected.emit({ objectKey: shape.ObjectKey, caption: this.GetPropertyDisplayValue(shape.Value) });
    }
  }

  public isLinkEnabled(): boolean {
    return this.selected.observers.length > 0;
  }
}
