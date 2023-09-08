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


import { HyperviewLayoutVertical } from './hyperview-layout-vertical';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

describe('HyperviewLayoutVertical', () => {

  afterAll(() => {
    clearStylesFromDOM();
  });

  const htmlElement = document.createElement('div');

  it('should create an instance', () => {
    const elements = [];
    const middlecenter = {
      position: 'MiddleCenter',
      element: htmlElement
    }
    elements.push(middlecenter);

    expect(() => {
      const vertical = new HyperviewLayoutVertical(elements);
    }).not.toThrowError();
  });

  it('should nothing to layout, if there are no elements', () => {
    const elements = [];

    expect(() => {
      const vertical = new HyperviewLayoutVertical(elements);

      const getMaxWidthSpy = spyOn<any>(vertical, 'getMaxWidth').and.callThrough();
      vertical.layout();

      expect(getMaxWidthSpy).not.toHaveBeenCalled();
    }).not.toThrowError();
  });
});

