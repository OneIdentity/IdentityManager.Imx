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
 * Copyright 2024 One Identity LLC.
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

import { TypedEntity } from '@imx-modules/imx-qbm-dbts';
import { QueuedActionState } from '../processing-queue/processing-queue.interface';
import { DataTileBadge } from './data-tile-badge.interface';

export interface DataSourceItemStatus {
  /**
   * Function of the row to determine if the checkbox is clickable.
   * @param item row entity
   * @returns if the checkbox is clickable
   */
  enabled: (item?: TypedEntity) => boolean;
  /**
   * Function of the row to determine if the row action should be allowed. We may want to prevent an entity from being interacted with while it is being processed.
   * @param item row entity
   * @returns if the row should be clickable
   */
  rowEnabled?: (item?: TypedEntity) => boolean;
  /**
   * Function to return the status of a entity in the queue.
   * @param item row entity
   * @returns the state of this item in the queue
   */
  status?: (item: TypedEntity) => QueuedActionState;
  getBadges?: (input: TypedEntity) => DataTileBadge[];
  getImagePath?: (item: TypedEntity) => Promise<string>;
}
