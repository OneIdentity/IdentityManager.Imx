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

import { EventEmitter } from '@angular/core';

import { ClassloggerService } from '../classlogger/classlogger.service';


/** Datasource of select component */
export class SelectDataSource {

  /** Fires when the datasource needs new data. */
  public needData: EventEmitter<number> = new EventEmitter();


  /** Returns the list of items of the datasource */
  public get rawData(): any[] {
    return this.cache;
  }

  private cache = [];

  constructor(private logger: ClassloggerService) {}

  /** Resets the datasource */
  public reset(): void {
    this.logger.debug(this, 'Resetting datasource');
    this.cache = [];
  }

  public getData(startIndex: number): void {
    this.needData.emit(startIndex);
  }

  public setData(items: any[]): void {
    this.logger.debug(this, `Setting cache with ${items.length}`);
    this.cache = items;
  }

}
