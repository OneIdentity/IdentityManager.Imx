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

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DuplicatePatternItem } from './duplicate-pattern-item';

/**
 * This component shows a list of all serviceitems that could not be added to the itshop pattern.
 */
@Component({
  selector: 'imx-duplicate-pattern-items',
  templateUrl: './duplicate-pattern-items.component.html',
  styleUrls: ['./duplicate-pattern-items.component.scss']
})
export class DuplicatePatternItemsComponent {

  public get columnNames(): string[] {
    return this.displayedColumns.map(c => c.name);
  }

  public description1 = '#LDS#Each product can be added to the product bundle only once.';
  public description2 = '#LDS#The following products have already been added to the product bundle and cannot be added again.';

  public readonly displayedColumns = [
    { name: 'Display', title: '#LDS#Product' }
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: {
      duplicatePatternItems: DuplicatePatternItem[]
    }
  ) {
  }
}
