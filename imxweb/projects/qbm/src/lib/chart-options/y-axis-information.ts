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

import { SeriesInformation } from './series-information';
import { YTickConfiguration, yAxisConfiguration } from 'billboard.js';

export class YAxisInformation {

  /**
   * Gets the series, that are displayed on the chart
   */
  public readonly series: SeriesInformation[];

  /**
   * Gets or sets the tick configuration
   */
  public tickConfiguration: YTickConfiguration;

  /**
   * Gets or sets the minimal value of the axis
   */
  public min: number;

  /**
   * Gets or sets the max value of the axis
   */
  public max: number;

  constructor(series: SeriesInformation[]) {
    this.series = series;
  }

  /**
   * Gets YAxisConfiguration object using 'min' 'may' and 'tickConfiguration'
   */
  public getAxisConfiguration(): yAxisConfiguration {
    return {
      max: this.max,
      min: this.min,
      tick: this.tickConfiguration
    };
  }

  /**
   * Gets the names object useable by billboard.js ChartOptions
   */
  public getNames(): { [key: string]: string } {
    const names: { [id: string]: string } = {};
    this.series.forEach(element => {
      names[element.name.replace(' ', '')] = element.name;
    });

    return names;
  }

  /**
   * Gets the color objects useable by billboard.js ChartOptions
   */
  public getColors(): { [key: string]: string } {
    const colors: { [id: string]: string } = {};
    this.series.forEach(element => {
      colors[element.name.replace(' ', '')] = element.color;
    });

    return colors;
  }
}
