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


import { Injectable } from '@angular/core';

import { OpsupportSystemoverview } from 'imx-api-qbm';
import { TypedEntityCollectionData } from 'imx-qbm-dbts';
import { RegistryService } from 'qbm';
import { SystemTreeNode } from './system-tree-node';

@Injectable()
export class SystemTreeDatabase {

  get CustomerName(): string {
    return this.customerName;
  }

  get CustomerEmail(): string {
    return this.customerEmail;
  }

  get ExceededTresholdsCounter(): number {
    return this.tresholdsCounter;
  }
  private dataMap: Map<string, OpsupportSystemoverview[]>;
  private categoryRegistry: RegistryService<OpsupportSystemoverview>;
  private exceededTresholdsRegistry: { [id: string]: number };
  private tresholdsCounter: number;
  private customerName = '';
  private customerEmail = '';

  /** Initial data from database */
  public initialize(entity: TypedEntityCollectionData<OpsupportSystemoverview>): SystemTreeNode[] {
    this.initalize();

    entity.Data.forEach((d: OpsupportSystemoverview) => {
      const category = d.Category.value;
      this.categoryRegistry.register(category, d);
      if (this.hasExceededTreshold(d)) {
        this.increaseThresholdRegistry(category, 1);
      }
      this.setCustomerInformation(d);
    });
    return this.createNodes();
  }

  public getChildren(node: string): OpsupportSystemoverview[] | undefined {
    return this.dataMap.get(node);
  }

  public isExpandable(node: string): boolean {
    return this.dataMap.has(node);
  }

  public export(): string {
    let exp = 'Category, Element, Value, QualityOfValue, RecommendedValue\r\n';

    const arr = Array.from(this.dataMap.entries());
    arr.forEach((item: [string, OpsupportSystemoverview[]]) => {
      item[1].forEach((d: OpsupportSystemoverview) => {
        const line = d.Category.value + ',' + d.Element.value + ',' + d.Value.value + ','
          + d.QualityOfValue.value + ',' + d.RecommendedValue.value;
        exp += line + '\r\n';
      });
    });
    return exp;
  }

  private hasExceededTreshold(item: OpsupportSystemoverview): boolean {
    return item.QualityOfValue.value <= 0.2;
  }

  private setCustomerInformation(d: OpsupportSystemoverview): void {
    // set Name and Email of Customer for header information
    if (d.Category.value !== 'Customer') {
      return;
    }
    if (d.Element.value === 'Customer Name') {
      this.customerName = d.Value.value;
    } else if (d.Element.value === 'Customer Email') {
      this.customerEmail = d.Value.value;
    }
  }

  private createNodes(): SystemTreeNode[] {
    const categories = Object.keys(this.categoryRegistry.Registry).sort();
    return categories.map(c => {
      this.dataMap.set(c, this.categoryRegistry.Registry[c]);
      return new SystemTreeNode(null, c, 0, true, this.exceededTresholdsRegistry[c]);
    });
  }

  private increaseThresholdRegistry(category: string, inc: number): void {
    if (!this.exceededTresholdsRegistry[category]) {
      this.exceededTresholdsRegistry[category] = 0;
    }
    this.exceededTresholdsRegistry[category] += inc;
    this.tresholdsCounter += inc;
  }

  private initalize(): void {
    this.dataMap = new Map<string, OpsupportSystemoverview[]>();
    this.categoryRegistry = new RegistryService<OpsupportSystemoverview>();
    this.exceededTresholdsRegistry = {};
    this.tresholdsCounter = 0;
  }
}
