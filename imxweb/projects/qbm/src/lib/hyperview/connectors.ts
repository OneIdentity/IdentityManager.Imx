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

import { Connector } from './connector';

interface Coord {
  X: number;
  Y: number;
}

/**
 * Class managing the connectors for a hyperview control.
 */
export class Connectors {

  public readonly connectorList: Connector[];

  public readonly maxValue = { X: 0, Y: 0 };

  constructor(connectors: Connector[]) {

    // get connectors from xml
    this.connectorList = connectors;

    this.repaintAllConnectors();
  }

  /**
   * Repaints all connectors.
   */
  private repaintAllConnectors(): void {

    // reset maxValue
    this.maxValue.X = 0;
    this.maxValue.Y = 0;

    for (const connector of this.connectorList) {
      this.drawConnector(connector);
    }
  }

  /**
   * Draws a connector between two shapes.
   */
  private drawConnector(connector: Connector): void {

    // get centerpoints of both shapes
    const p1 = this.centerPoint(connector.element1);
    const p2 = this.centerPoint(connector.element2);

    const deltaX = p2.X - p1.X;
    const deltaY = p2.Y - p1.Y;

    // calculate new curve coordinates
    let curveCoords = 'M ' + p1.X + ' ' + p1.Y + ' C ';
    let m = 0;
    let middle: number;
    if (deltaX !== 0) {
      m = deltaY / deltaX;
    }
    if (m < 0) {
      middle = (p1.X + (deltaX * 0.3));
      curveCoords += middle + ' ' + p1.Y + ' ' + middle + ' ' + p2.Y;
    } else {
      middle = (p1.Y + (deltaY * 0.3));
      curveCoords += p1.X + ' ' + middle + ' ' + p2.X + ' ' + middle;
    }
    curveCoords += ' ' + p2.X + ' ' + p2.Y;

    connector.data = curveCoords;

    // determine maximum x and y value for calculating width and height
    this.maxValue.X = Math.max(this.maxValue.X, p2.X);
    this.maxValue.Y = Math.max(this.maxValue.Y, p2.Y);
  }

  /**
   * Returns the center point for the given element.
   */
  private centerPoint(element: HTMLElement): Coord {
    return {
      X: Math.round(element.offsetLeft + (element.offsetWidth / 2)),
      Y: Math.round(element.offsetTop + (element.offsetHeight / 2))
    };
  }
}
