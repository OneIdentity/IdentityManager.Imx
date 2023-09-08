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

import { DataModelViewConfig } from 'imx-qbm-dbts';

export interface DSTViewConfig extends DataModelViewConfig {
  /**
   * Gets or sets the ID of the related view.
   */
  ViewId?: string;

  /**
   * Sets the display name for the view
   */
  DisplayName?: string;

  /**
   * Sets whether the view should be used on page load
   */
  UseAsDefault: boolean;

  /**
   * Sets if the view is writable
   */
  IsReadOnly?: boolean;

  OptionalColumns?: string[];

  /** Storage for arbitrary URL filter parameter values. */
  AdditionalParameters?: {
      [key: string]: string;
  };
}

export interface DataSourceToolbarViewConfig {
  /**
   * The list of available configs
   */
  viewConfigs?: DSTViewConfig[];

  /**
   * The list of available configs
   */
  viewId: string;

}
