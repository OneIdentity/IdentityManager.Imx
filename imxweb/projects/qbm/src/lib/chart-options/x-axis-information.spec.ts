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

import { XAxisInformation } from './x-axis-information';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

describe('XAxisInformation', () => {

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create an instance', () => {
    expect(new XAxisInformation('string', ['a', 'b', 'c'], {})).toBeDefined();
  });

  it('can determine types', () => {
    expect(new XAxisInformation('string', [], {}).getAxisConfiguration().type).toEqual('category');
    expect(new XAxisInformation('number', [], {}).getAxisConfiguration().type).toEqual('indexed');
    expect(new XAxisInformation('date', [], {}).getAxisConfiguration().type).toEqual('timeseries');
  });

  it('can get axis data', () => {
    const info = new XAxisInformation('number', [1, 2, 3], {});
    expect(info.getAxisData()).toEqual(['x', 1, 2, 3]);
  });

});
