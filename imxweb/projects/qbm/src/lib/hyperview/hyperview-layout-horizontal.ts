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
import { HvElement, HyperViewLayout, LayoutResult, toPixelString } from './hyperview-types';

/**
 * Hyperview layouter that arranges the elements in a horizontal line.
 */
export class HyperviewLayoutHorizontal implements HyperViewLayout {

  private elements: HvElement[];

  constructor(elements: HvElement[]) {
    this.elements = elements;
  }

  /**
   * layouting the hyperview according to positions of each shape.
   */
  public layout(): LayoutResult {
    const es = this.elements;
    if (es.length > 0) {
      const firstElement = es[0].element;
      firstElement.style.left = '0px';

      es.forEach((node, index) => {
        const element = node.element;

        // first set position=absolute vorher setzen: this affects the height of the item
        element.style.position = 'absolute';

        if (index > 0) {
          const previousElement = es[index - 1].element;
          element.style.left = toPixelString((previousElement.offsetLeft + previousElement.offsetWidth + 10));
          element.style.zIndex = '100';
        }
      });

      // calculate the maximum height
      const maxw = this.getMaxHeight();

      firstElement.style.top = toPixelString(((maxw - firstElement.offsetHeight) / 2));

      es.slice(1).forEach((node) => {
        const element = node.element;
        element.style.top = toPixelString(((maxw - element.offsetHeight) / 2));
      });

      return { size: { width: 0, height: maxw } };
    }
  }

  /**
   * returns the connectorProvider for this layouter
   */
  public getConnectorProvider(): IConnectorProvider {
    return new ConnectorProvider(false /* connect one shape to the next */);
  }

  /**
   * determines the height of the highest element
   * (needed for the elements to be centered when aligned)
   */
  private getMaxHeight(): number {
    let maxHeight = 0;
    for (const node of this.elements) {
      maxHeight = Math.max(maxHeight, node.element.offsetHeight);
    }
    return maxHeight;
  }
}
