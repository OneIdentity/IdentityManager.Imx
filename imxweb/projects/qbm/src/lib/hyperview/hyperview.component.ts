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

import { Component, ViewChild, ElementRef, Input, AfterViewChecked, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';

import { Connectors } from './connectors';
import { Connector } from './connector';
import { HyperviewLayoutHierarchical } from './hyperview-layout-hierarchical';
import { HyperviewLayoutVertical } from './hyperview-layout-vertical';
import { HyperviewLayoutHorizontal } from './hyperview-layout-horizontal';
import { HyperViewLayout, HvSettings, HvElement, ShapeClickArgs, toPixelString } from './hyperview-types';
import { ShapeData } from 'imx-api-qbm';
import { ClassloggerService } from '../classlogger/classlogger.service';

export enum ShapeType {
  ListShape,
  PropertyShape,
  SimpleShape,
}

/**
 * Hyperview component that takes the first child element as its primary element, and all other child elements
 * as secondary elements.
 */
@Component({
  selector: 'imx-hyperview',
  templateUrl: './hyperview.component.html',
  styleUrls: ['./hyperview.component.scss']
})
export class HyperviewComponent implements AfterViewChecked {

  private get mainElem(): HTMLElement {
    return this.elRef.nativeElement;
  }
  public static connectorsCssClass = 'connectors';

  public connectors: Connectors;

  // required to make the function and the enum available in the component :-/
  public toPixelString = toPixelString;
  public ShapeType = ShapeType;

  @ViewChild('elements', { static: true }) public elRef: ElementRef;

  @Input() public layout: 'Hierarchical' | 'Vertical' | 'Horizontal';

  @Input() public shapes: ShapeData[];

  @Input() public fontSize: 'inherit' | 'medium' | 'small' | 'x-small' | 'large' = 'inherit';

  @Output() public selected: EventEmitter<ShapeClickArgs> = new EventEmitter();

  private settings: HvSettings;

  /**
   * Creates a new hyperview component.
   */
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private logger: ClassloggerService
  ) { }

  /**
   * Returns the {@link ShapeType|type} for the given {@link ShapeData|shape}.
   * @param shape the shape for determining the type
   */
  public GetShapeType(shape: ShapeData): ShapeType {
    if (shape.Elements) {
      return ShapeType.ListShape;
    }
    if (shape.Properties) {
      return ShapeType.PropertyShape;
    }
    return ShapeType.SimpleShape;
  }

  /**
   * Returns the effive color for the given {@link ShapeData|shape}.
   * @param shape the shape for determining the effective color
   */
  public GetShapeEffectiveColor(shape: ShapeData): string {
    let color = shape.ElementColor || '';
    if (color.length === 8) {
      // strip alpha component
      color = color.substr(2, 6);
    }
    // return a valid CSS hex value
    return '#' + color;
  }

  /**
   * Returns the {@link Connector|connectors} array.
   */
  public getConnectors(): Connector[] {
    return this.connectors.connectorList.filter((connector: Connector) => !connector.isHidden);
  }

  /**
   * Returns the width of the hyperview determining by the maximum x-value of the connectors.
   */
  public getWidth(): string {
    return toPixelString(this.connectors.maxValue.X);
  }

  /**
   * Returns the height of the hyperview determining by the maximum y-value of the connectors.
   */
  public getHeight(): string {
    return toPixelString(this.connectors.maxValue.Y);
  }

  public ngAfterViewChecked(): void {
    this.settings = this.buildSettings();

    if (this.settings.elements == null || this.settings.elements.length === 0) {
      this.logger.trace(this, 'Hyperview: Nothing to do. Aborting...');
      return;
    }

    const layouter = this.buildLayouter();

    layouter.layout();

    this.connectors = new Connectors(layouter.getConnectorProvider().getConnectors(this.settings));
    this.changeDetectorRef.detectChanges();
  }

  private buildLayouter(): HyperViewLayout {
    if (!this.layout) {
      this.layout = 'Hierarchical';
      this.logger.debug(this, 'Hyperview: layoutType is not specified so use the default hierarchical layout ');
    }
    let layouter: HyperViewLayout;

    if (this.layout === 'Hierarchical') {
      if (this.settings.enforceVerticalLayout) {
        // vertical layout is enforced, so switch to vertical layout
        this.logger.debug(this, 'Hyperview: because of settings, switch layoutType to vertical.');
        layouter = new HyperviewLayoutVertical(this.settings.elements);
      } else {
        layouter = new HyperviewLayoutHierarchical(this.settings.elements, this.logger);
      }
    } else {
      if (this.layout === 'Horizontal') {
        layouter = new HyperviewLayoutHorizontal(this.settings.elements);
      } else {
        layouter = new HyperviewLayoutVertical(this.settings.elements);
      }
    }
    return layouter;
  }

  /**
   * Returns the elements of the hyperview.
   */
  private getElements(): HvElement[] {
    const res: HvElement[] = [];

    for (const node of Array.from(this.mainElem.childNodes)) {
      const element = node as HTMLElement;
      if (!element.style || element.style.display === 'none') {
        continue;
      }
      const layout = element.getAttribute('imx-layout');
      const position = layout !== 'Center'
        ? layout
        : 'MiddleCenter';
      res.push({ position, element });
    }

    this.logger.trace(this, `using ${res.length} elements for hyperview, out of ${this.mainElem.childNodes.length} DOM nodes`);
    return res;
  }

  private buildSettings(): HvSettings {
    // TODO: implemente for checking if phone device const isPhoneDevice = this.deviceState.isPhoneDevice();
    return {
      enforceVerticalLayout: false,
      // use tablet mode only when vertical layout is not used anyway
      elements: this.getElements()
    };
  }

}
