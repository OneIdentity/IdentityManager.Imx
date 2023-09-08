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

import { xAxisConfiguration, XTickConfiguration } from 'billboard.js';

export class XAxisInformation {
  /**
   * gets the values for the x axis
   */
  public readonly values: (number | Date | string)[];

  /**
   * Gets the datatype of the axis
   */
  public readonly dataType: 'number' | 'date' | 'string';

  /**
   * Gets the tick configuration for the axis
   */
  public readonly tickConfiguration: XTickConfiguration;

  public constructor(dataType: 'number' | 'date' | 'string', values: (number | Date | string)[], xTickConfiguration?: XTickConfiguration) {
    this.dataType = dataType;
    this.values = values;
    this.tickConfiguration = xTickConfiguration;
  }

  /**
   * Combines the axis data with its title, so that it's useable by the billboard.js ChartOptions
   */
  public getAxisData(): any[] {
    return ['x' as any].concat(this.values);
  }

  /**
   * Gets XAxisConfiguration object using 'values' 'dataType' and 'tickConfiguration'
   */
  public getAxisConfiguration(): xAxisConfiguration {
    let tickType: 'category' | 'indexed' | 'log' | 'timeseries';
    switch (this.dataType) {
      case 'string':
        tickType = 'category';
        break;
      case 'date':
        tickType = 'timeseries';
        break;
      default:
        tickType = 'indexed';
    }
    return {
      type: tickType,
      tick: this.tickConfiguration,
    };
  }
}
