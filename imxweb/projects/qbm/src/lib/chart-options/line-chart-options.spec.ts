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

import { LineChartOptions } from './line-chart-options';
import { XAxisInformation } from './x-axis-information';
import { YAxisInformation } from './y-axis-information';
import { SeriesInformation } from './series-information';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

describe('LineChartOptions', () => {

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create an instance', () => {
    expect(new LineChartOptions(null, null)).toBeDefined();
  });

  [
    { isSmooth: true, isArea: true, expect: 'area-spline' },
    { isSmooth: true, isArea: false, expect: 'spline' },
    { isSmooth: false, isArea: true, expect: 'area' },
    { isSmooth: false, isArea: false, expect: 'line' }
  ].forEach(element => {
    it(`gets line type with smooth lines = ${element.isSmooth} and colored area = ${element.isArea}`, () => {
      const xAxisInformation = new XAxisInformation('number', [1, 2, 3]);
      const yAxisInformation = new YAxisInformation([new SeriesInformation('dummy', [1, 2, 3])]);
      const chart = new LineChartOptions(xAxisInformation, yAxisInformation);
      chart.useCurvedLines = element.isSmooth;
      chart.colorArea = element.isArea;
      expect(chart.options.data.type).toBe(element.expect);
    });

  });
  it('should create an instance', () => {
    const xAxisInformation = new XAxisInformation('number', [1, 2, 3]);
    const yAxisInformation = new YAxisInformation([new SeriesInformation('dummy', [1, 2, 3])]);
    const chart = new LineChartOptions(xAxisInformation, yAxisInformation);
    expect(chart.options.data.type).toBe('area-spline');
  });


});
