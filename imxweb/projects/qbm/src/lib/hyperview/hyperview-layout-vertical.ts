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

import { HyperViewLayout, toPixelString, HvElement, LayoutResult } from './hyperview-types';
import { IConnectorProvider, ConnectorProvider } from './connector-provider';

/**
 * Layouter that aligns the elements vertically, with the root node at the top.
 */
export class HyperviewLayoutVertical implements HyperViewLayout {

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

      // get the maximum width
      const maxw = this.getMaxWidth();

      es.forEach((node, index) => {
        const element = node.element;
        element.style.position = 'absolute';
        element.style.left = toPixelString(((maxw - element.offsetWidth) / 2));
        if (index > 0) {
          const previousElement = es[index - 1].element;
          element.style.top = toPixelString((previousElement.offsetTop +
            previousElement.offsetHeight +
            10));
        } else {
          element.style.top = '0px';
        }
      });

      return { size: { width: maxw, height: 0 } };
    }
  }

  /**
   * returns the connectorProvider for this layouter
   */
  public getConnectorProvider(): IConnectorProvider {
    return new ConnectorProvider(false /* connect one shape to the next */);
  }

  /**
   * Returns the maximum width of the given elements
   */
  private getMaxWidth(): number {
    let maxWidth = 0;
    for (const node of this.elements) {
      maxWidth = Math.max(maxWidth, node.element.offsetWidth);
    }
    return maxWidth;
  }
}
