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

export class SeriesInformation {

  /**
   * Gets the name of the serie
   */
  public readonly name: string;

  /**
   * Gets the color of the serie
   */
  public readonly color: string;

  /**
   * Gets the values of the serie
   */
  public readonly values: (number | Date)[];

  constructor(name: string, values: (number | Date)[], color?: string) {
    this.name = name;
    this.values = values;
    this.color = color;
  }

  /**
   * Combines the axis data with its title, so that it's useable by the billboard.js ChartOptions
   */
  public getSerie(): any[] {
    return ([this.name.replace(' ', '') as any]).concat(this.values);
  }
}
