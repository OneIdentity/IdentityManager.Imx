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

import * as TypeMoq from 'typemoq';

import { Connectors } from './connectors';
import { Connector } from './connector';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

describe('Connectors', () => {

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create connectors in each direction', () => {

    const elem1 = TypeMoq.Mock.ofType<HTMLElement>();
    elem1.setup(e => e.offsetLeft).returns(() => 10);
    elem1.setup(e => e.offsetWidth).returns(() => 0);
    elem1.setup(e => e.offsetTop).returns(() => 10);
    elem1.setup(e => e.offsetHeight).returns(() => 0);

    const elem2 = TypeMoq.Mock.ofType<HTMLElement>();
    elem2.setup(e => e.offsetLeft).returns(() => 50);
    elem2.setup(e => e.offsetWidth).returns(() => 0);
    elem2.setup(e => e.offsetTop).returns(() => 50);
    elem2.setup(e => e.offsetHeight).returns(() => 0);

    const elem3 = TypeMoq.Mock.ofType<HTMLElement>();
    elem3.setup(e => e.offsetLeft).returns(() => 75);
    elem3.setup(e => e.offsetWidth).returns(() => 0);
    elem3.setup(e => e.offsetTop).returns(() => 25);
    elem3.setup(e => e.offsetHeight).returns(() => 0);


    const html1 = elem1.object;
    const html2 = elem2.object;
    const html3 = elem3.object;

    const conn1 = new Connector(html1, html2);
    const conn2 = new Connector(html1, html1);
    const conn3 = new Connector(html2, html3);

    const connectorList = [];
    connectorList.push(conn1, conn2, conn3);

    expect(() => {
      const connectors = new Connectors(connectorList);

      expect(connectors.maxValue.X).toBe(75);
      expect(connectors.maxValue.Y).toBe(50);
    }).not.toThrowError();
  });

});
