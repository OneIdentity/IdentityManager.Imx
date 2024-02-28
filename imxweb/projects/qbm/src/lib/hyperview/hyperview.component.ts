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
  ViewChild,
  ElementRef,
  Input,
  ChangeDetectorRef,
  EventEmitter,
  Renderer2,
  AfterViewInit,
  OnDestroy,
  AfterViewChecked,
  QueryList,
  ViewChildren,
  Output,
} from '@angular/core';

import { Connectors } from './connectors';
import { Connector } from './connector';
import { HyperviewLayoutHierarchical } from './hyperview-layout-hierarchical';
import { HyperviewLayoutVertical } from './hyperview-layout-vertical';
import { HyperviewLayoutHorizontal } from './hyperview-layout-horizontal';
import {
  HyperViewLayout,
  HvSettings,
  HvElement,
  ShapeClickArgs,
  toPixelString,
  LayoutResult,
  HyperViewNavigation,
  HyperViewNavigationEnum,
} from './hyperview-types';
import { ShapeData } from 'imx-api-qbm';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { Subscription } from 'rxjs';

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
  styleUrls: ['./hyperview.component.scss'],
})
export class HyperviewComponent implements AfterViewInit, OnDestroy, AfterViewChecked {
  @Input() public fontSize: 'inherit' | 'medium' | 'small' | 'x-small' | 'large' = 'inherit';
  @Input() public selected: EventEmitter<ShapeClickArgs> = new EventEmitter();
  @Input() public layout: 'Hierarchical' | 'Vertical' | 'Horizontal';
  @Input() public showResetButton = true;
  @Input() public navigation: HyperViewNavigation;
  @Input() set shapes(value: ShapeData[]) {
    this._shapes = value;
    if (value?.length > 0) {
      this.setupLayout();
    }
  }
  get shapes(): ShapeData[] {
    return this._shapes;
  }
  /**
   * Emit the {@link HyperViewNavigationEnum|type} to the parent component when navigation changed.
   */
  @Output() public navigationChanged = new EventEmitter<HyperViewNavigationEnum>();
  @ViewChild('elements', { static: true }) public elRef: ElementRef<HTMLElement>;
  @ViewChild('root', { static: true }) public rootElem: ElementRef<HTMLElement>;
  @ViewChild('container', { static: true }) public containerElem: ElementRef<HTMLElement>;
  @ViewChildren('shapeList') public shapeList: QueryList<ElementRef<HTMLElement>>;
  public _shapes: ShapeData[];
  public static connectorsCssClass = 'connectors';
  public connectors: Connector[] = [];
  // required to make the function and the enum available in the component :-/
  public toPixelString = toPixelString;
  public ShapeType = ShapeType;
  public viewChanged = false;
  public navigationEnum = HyperViewNavigationEnum;
  private settings: HvSettings;
  private middleCenterShape: HvElement;
  private middleCenterPosition = 'MiddleCenter';
  private baseScale = 1;
  private baseTransformWidth = 0;
  private subscriptions$: Subscription[] = [];

  /**
   * Creates a new hyperview component.
   */
  constructor(private changeDetectorRef: ChangeDetectorRef, private logger: ClassloggerService, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.setupLayout();

    // register for element resize
    const observer = new ResizeObserver(() => {
      this.logger.trace(this, 'resize event detected, marking layout as dirty');
      this.layoutDirty = true;
    });
    const elem = this.containerElem.nativeElement;
    observer.observe(elem);
    this.subscriptions$.push(new Subscription(() => observer.unobserve(elem)));

    this.subscriptions$.push(
      this.shapeList.changes.subscribe(() => {
        this.logger.trace(this, 'shape list changed, marking layout as dirty');
        this.layoutDirty = true;
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
  }

  private layoutDirty = false;

  ngAfterViewChecked(): void {
    if (this.layoutDirty) {
      this.layoutDirty = false;
      this.setupLayout();
    }
  }

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
   * Returns the effective color for the given {@link ShapeData|shape}.
   * @param shape the shape for determining the effective color
   */
  public GetShapeEffectiveColor(shape: ShapeData): string {
    let color = shape.ElementColor || '';
    if (color.length === 8) {
      // strip alpha component
      color = color.substring(2);
    }
    // return a valid CSS hex value
    return '#' + color;
  }

  public setupLayout(): void {
    this.settings = this.buildSettings();
    if (this.settings.elements == null || this.settings.elements.length === 0) {
      this.logger.trace(this, 'Hyperview: Nothing to do. Aborting...');
      return;
    }

    const layouter = this.buildLayouter();
    const layoutResult = layouter.layout();
    this.connectors = new Connectors(layouter.getConnectorProvider().getConnectors(this.settings)).connectorList.filter(
      (connector) => !connector.isHidden
    );
    this.scrollToMiddleCenterShape(layoutResult);
    this.changeDetectorRef.detectChanges();
  }

  // Reset hyperview view to default (show the whole layout)
  public onReset(): void {
    this.renderer.setStyle(this.containerElem.nativeElement, 'transform', `scale(1)`);
    this.renderer.setStyle(this.rootElem.nativeElement, 'top', '');
    this.renderer.setStyle(this.rootElem.nativeElement, 'left', `${this.baseTransformWidth}px`);
    this.renderer.setAttribute(this.rootElem.nativeElement, 'att-relative-x', `${this.baseTransformWidth}`);
    this.renderer.removeAttribute(this.rootElem.nativeElement, 'att-relative-y');
    this.renderer.setAttribute(this.containerElem.nativeElement, 'att-scale', '1');
    this.viewChanged = false;
  }

  // Change viewChanged state if zoom or drag emitted from zoom-pan.directive
  public onViewChanged(): void {
    this.viewChanged = true;
  }

  public onNavigationChanged(navigation: HyperViewNavigationEnum): void {
    this.navigationChanged.emit(navigation);
  }

  // Rebuild the layout if a shape size is changed.
  public onChangeShapeSize(): void {
    this.setupLayout();
  }

  public get selectedHyperviewCaption(): string {
    const centerObj = this.shapes.filter((shape) => shape.LayoutType === 'MiddleCenter')?.[0];
    return !!centerObj?.HeaderText ? `${centerObj.HeaderText}: ${centerObj.Caption}` : centerObj?.Caption;
  }

  private scrollToMiddleCenterShape(layoutResult: LayoutResult) {
    this.rootElem.nativeElement.style.width = layoutResult.size.width + 'px';
    this.rootElem.nativeElement.style.height = layoutResult.size.height + 'px';
    const heightScale = this.containerElem.nativeElement.offsetHeight / layoutResult.size.height;
    const widthScale = this.containerElem.nativeElement.offsetWidth / layoutResult.size.width;
    this.baseScale = Math.min(heightScale, widthScale, 1);

    this.baseTransformWidth = (this.containerElem.nativeElement.offsetWidth - layoutResult.size.width * this.baseScale) / 2;
    this.renderer.setStyle(this.rootElem.nativeElement, 'transform', `scale(${this.baseScale})`);
    this.renderer.setStyle(this.rootElem.nativeElement, 'left', `${this.baseTransformWidth}px`);
    this.renderer.setAttribute(this.rootElem.nativeElement, 'att-relative-x', `${this.baseTransformWidth}`);
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
    this.changeDetectorRef.detectChanges();
    for (const shp of this.shapeList) {
      const element = shp.nativeElement;
      if (element.style && element.style.display === 'none') {
        continue;
      }
      let position = element.getAttribute('imx-layout');
      if (position === 'Center' || position === this.middleCenterPosition) {
        this.middleCenterShape = { position: this.middleCenterPosition, element };
        res.push(this.middleCenterShape);
      } else {
        res.push({ position, element });
      }
    }

    this.logger.trace(this, `using ${res.length} elements for hyperview, out of ${this.shapeList.length} DOM nodes`);
    return res;
  }

  private buildSettings(): HvSettings {
    return {
      enforceVerticalLayout: false,
      elements: this.getElements(),
    };
  }
}
