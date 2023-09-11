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


import { IConnectorProvider, ConnectorProvider } from './connector-provider';
import { toPixelString, HvElement, HvCell, Size, HyperViewLayout, LayoutResult } from './hyperview-types';
import { ClassloggerService } from '../classlogger/classlogger.service';

/**
 * Hyperview layouter that arranges the elements hierarchical.
 */
export class HyperviewLayoutHierarchical implements HyperViewLayout {

  /**
   * Returns a list of all possible positions for a shape in a hyperview.
   */
  private positions: ReadonlyArray<string> = [
    'TopLeft',
    'TopCenter',
    'TopRight',
    'MiddleLeft',
    'MiddleCenter',
    'MiddleRight',
    'BottomLeft',
    'BottomCenter',
    'BottomRight'
  ];

  // waiting for https://github.com/Microsoft/TypeScript/issues/13042
  private vLayoutElements: {
    [id: string /* should be keyof Positions*/]: HvCell
  };

  constructor(
    private readonly elements: HvElement[],
    private logger: ClassloggerService
  ) {
    this.elements = elements;
    const elems = this.elements;
    const centerElement = elems.findIndex(e => e.position === 'MiddleCenter');
    if (centerElement === -1) {
      throw new Error('A shape with MiddleCenter position is required for hierarchical layout.');
    } else if (centerElement !== 0) {
      // make the center element the first in the list, because the rest of the code
      // assumes that the central element comes first.
      const swap = elems[centerElement];
      elems[centerElement] = elems[0];
      elems[0] = swap;
    }

  }

  /**
   * layouting the hyperview according to positions of each shape.
   */
  public layout(): LayoutResult {
    this.clearVLayoutElements();
    const elems = this.vLayoutElements;

    // sort all layout elements in the proper arrays
    for (const element of this.elements) {
      let pos = this.positions.indexOf(element.position);
      if (pos === -1) {
        pos = 2;
      }

      elems[this.positions[pos]].elements.push(element);
    }

    // calculate and set the size of each element
    for (const position of this.positions) {
      elems[position].size = this.getMaxSizeOfElements(elems[position].elements);
    }

    // Layout the elements as they should be displayed.
    // The upper, the middle and then the lower div boxes are successively laid out.
    let sCenter = { width: 0, height: 0 };
    sCenter = this.layoutTopShapes(sCenter, elems);
    sCenter = this.layoutMiddleShapes(sCenter, elems);
    sCenter = this.layoutBottomShapes(sCenter, elems);

    // normalize the view
    this.normalize();

    const finalSize = this.getSumSizeOfElements(this.elements);

    return {
      size: finalSize
    };

  }

  /**
   * returns the connectorProvider for this layouter
   */
  public getConnectorProvider(): IConnectorProvider {
    return new ConnectorProvider(true /* hierarchical layout */);
  }

  private layoutTopShapes(sCenter: Size, elems: { [id: string]: HvCell; }): Size {
    // layout top left shapes
    sCenter = this.getMaxSize(elems['MiddleCenter'].size, elems['TopCenter'].size.width, elems['MiddleLeft'].size.height);
    this.layoutElements(elems['TopLeft'], sCenter, -2, -1, false, false);

    // layout top center shapes
    sCenter = this.getMaxSize(elems['MiddleCenter'].size, elems['TopCenter'].size.width,
      Math.max(elems['MiddleLeft'].size.height, elems['MiddleRight'].size.height));
    this.layoutElements(elems['TopCenter'], sCenter, 0, -1, true, false);

    // layout top right shapes
    sCenter = this.getMaxSize(elems['MiddleCenter'].size, elems['TopCenter'].size.width, elems['MiddleRight'].size.height);
    this.layoutElements(elems['TopRight'], sCenter, 2, -1, false, false);
    return sCenter;
  }

  private layoutBottomShapes(sCenter: Size, elems: { [id: string]: HvCell; }): Size {
    // layout bottom left shapes
    sCenter = this.getMaxSize(elems['MiddleCenter'].size, elems['BottomCenter'].size.width, elems['MiddleLeft'].size.height);
    this.layoutElements(elems['BottomLeft'], sCenter, -2, 1, false, false);

    // layout bottom center shapes
    sCenter = this.getMaxSize(elems['MiddleCenter'].size, elems['BottomCenter'].size.width,
      Math.max(elems['MiddleLeft'].size.height, elems['MiddleRight'].size.height));
    this.layoutElements(elems['BottomCenter'], sCenter, 0, 1, true, false);

    // layout bottom right shapes
    sCenter = this.getMaxSize(elems['MiddleCenter'].size, elems['BottomCenter'].size.width, elems['MiddleRight'].size.height);
    this.layoutElements(elems['BottomRight'], sCenter, 2, 1, false, false);
    return sCenter;
  }

  private layoutMiddleShapes(sCenter: Size, elems: { [id: string]: HvCell; }): Size {
    // layout middle left shapes
    sCenter = this.getMaxSize(elems['MiddleCenter'].size, 0, elems['MiddleLeft'].size.height);
    this.layoutElements(elems['MiddleLeft'], sCenter, -1, 0, false, true);

    // layout middle center shapes
    this.layoutElements(elems['MiddleCenter'], sCenter, 0, 0, true, true);

    // layout middle right shapes
    sCenter = this.getMaxSize(elems['MiddleCenter'].size, 0, elems['MiddleRight'].size.height);
    this.layoutElements(elems['MiddleRight'], sCenter, 1, 0, false, true);
    return sCenter;
  }

  private clearVLayoutElements(): void {
    this.vLayoutElements = {};
    this.positions.forEach(p => {
      this.vLayoutElements[p] = { elements: [], size: { width: 0, height: 0 } };
    });
  }

  /**
   * Normalizes the view by moving all components into the visible area.
   */
  private normalize(): void {

    // the control should now be placed in the edge
    const clientcenter = { X: 0, Y: 0 };

    let minx = Number.MAX_VALUE;
    let miny = Number.MIN_VALUE;

    // calculate the maximum movement
    for (const node of this.elements) {
      minx = Math.min(node.element.offsetLeft, minx);
      miny = Math.min(node.element.offsetTop, miny);
    }

    // negate to better understand the movement
    minx = -minx;
    miny = -miny;

    minx = Math.max(minx, clientcenter.X);
    miny = Math.max(miny, clientcenter.Y * 3 / 5);

    // move elements
    this.elements.forEach((node, index) => {
      const oldLeft = node.element.style.left;
      const oldTop = node.element.style.top;

      const left = toPixelString((node.element.offsetLeft + minx));
      const top = toPixelString((node.element.offsetTop + miny));

      node.element.style.left = left;
      node.element.style.top = top;

      this.logger.trace(this, `normalized position for element ${index}: (${oldLeft},${oldTop}) -> (${left},${top})`);
    });
  }

  /**
   * Returns the minimum rectangle size that covers the given sizes.
   */
  private getMaxSize(sCenter: Size, iWidth: number, iHeight: number): Size {
    return { width: Math.max(sCenter.width, iWidth), height: Math.max(sCenter.height, iHeight) };
  }

  /**
   * Layout the nodes by arranging the nodes according to the algorithm
   * of the C# class "HierarchicalLayout".
   * @param regElements the div elements that belong to a position
   * @param centerSize the center of the range
   * @param dx taken from the class
   * @param dy taken from the class
   * @param bX taken from the class
   * @param bY taken from the class
   */
  private layoutElements(regElements: HvCell, centerSize: Size, dx: number, dy: number, bX: boolean, bY: boolean): void {
    const padding = 50;
    const regSize = regElements.size;
    let cX = 0;
    let cY = 0;

    if (dx > 0) {
      cX = centerSize.width / 2 + padding;
    }

    if (dx < 0) {
      cX = -centerSize.width / 2;
    }

    if (dy > 0) {
      cY = centerSize.height / 2 + padding;
    }

    if (dy < 0) {
      cY = -centerSize.height / 2;
    }

    for (const regElement of regElements.elements) {
      if (dx < 0) {
        cX -= regElement.element.offsetWidth + padding;
      }

      if (dy < 0) {
        cY -= regElement.element.offsetHeight + padding;
      }

      regElement.element.style.left = toPixelString((cX - (bX ? regSize.width / 2 : 0)));
      regElement.element.style.top = toPixelString((cY - (bY ? regSize.height / 2 : 0)));

      // AutoReset in Outer regions
      if (Math.abs(dx) > 1) {
        dx = 0;
        cX = regElement.element.offsetLeft;
      }

      if (Math.abs(dy) > 1) {
        dy = 0;
        cY = regElement.element.offsetTop;
      }

      if (dx > 0) {
        cX += regSize.width + padding;
      }

      if (dy > 0) {
        cY += regSize.height + padding;
      }
    }
  }

  /**
   * Returns the minimum rectangle size that covers all the given elements.
   */
  private getMaxSizeOfElements(vElements: HvElement[]): Size {
    let layoutSize: Size = {
      width: 0,
      height: 0
    };

    for (const node of vElements) {
      const shape = node.element;
      layoutSize = {
        width: Math.max(layoutSize.width, shape.offsetWidth),
        height: Math.max(layoutSize.height, shape.offsetHeight)
      };
    }

    return layoutSize;
  }

  private getSumSizeOfElements(vElements: HvElement[]): Size {
    let layoutSize: Size = {
      width: 0,
      height: 0
    };

    for (const node of vElements) {
      const shape = node.element;
      layoutSize = {
        width: Math.max(layoutSize.width, shape.offsetLeft + shape.offsetWidth),
        height: Math.max(layoutSize.height, shape.offsetTop + shape.offsetHeight)
      };
    }

    return layoutSize;
  }
}
