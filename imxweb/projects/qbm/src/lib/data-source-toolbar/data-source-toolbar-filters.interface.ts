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

import { DataModelFilter, DataModelFilterOption } from 'imx-qbm-dbts';

export interface DataSourceToolbarFilter extends DataModelFilter {
  /**
   * The value currently selected
   */
  CurrentValue?: string;

  /**
   * The initial value to be selected
   */
  InitialValue?: string;

  /**
   * The column to filter over, if local filtering
   */
  Column?: string;
}

interface DataModelFilterOptionExtended extends DataModelFilterOption {
  IsRegex?: boolean;
}

export interface DataSourceToolbarSelectedFilter {
  /**
   * The option that was selected
   */
  selectedOption: DataModelFilterOptionExtended;
  /**
   * The filter the value was selected for
   */
  filter: DataSourceToolbarFilter;

  /**
   * Indicates if the selected filter is not part of the standard datamodel filters
   * and therefore is controlled/managed from outside the DataSourceToolbarComponent
   */
  isCustom?: boolean;
}
