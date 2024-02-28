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

import { FilterData, IEntity } from 'imx-qbm-dbts';

/**
 * Provides information for the selection of a filter tree.
 * It is used to unify the information, that is provided by the tree and a loaded configuration
 */
export interface FilterTreeSelectionArg {
  /**
   * The text, that is displayed on chips.
   */
  display: string;
  /**
   * The real filter information.
   */
  filter: FilterData;

  /**
   * An optional entity, that is used for data
   */
  entity?: IEntity;
}

/**
 * Provides an implementation of FilterTreeSelectionArg, that only needs an entity.
 */
export class FilterTreeDialogResultArg implements FilterTreeSelectionArg {
  public display: string;
  public filter: FilterData;

  constructor(public readonly entity: IEntity) {
    this.display = entity.GetColumn('LongDisplay').GetValue();
    this.filter = entity.GetColumn('Filter').GetValue();
  }
}
