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

import { PortalEntitlement, PortalApplicationinshop, PortalApplication } from 'imx-api-aob';
import { LifecycleAction } from './lifecycle-action.enum';

/**
 * Interface for the {@link MAT_DIALOG_DATA|MAT_DIALOG_DATA} of the {@link LifecycleActionComponent|LifecycleActionComponent}
 */
export interface LifecycleActionParameter {

  /** The mode to show the dialog. */
  action: LifecycleAction;

  type: 'AobEntitlement' | 'AobApplication';

  /** The list of elements which the {@link LifecycleActionComponent|LifecycleActionComponent} should show. */
  elements: PortalEntitlement[] | PortalApplication[];

  /** The list of shops for publishing the {@link PortalApplication|PortalApplication} or the {@link PortalEntitlement|PortalEntitlements} */
  shops: PortalApplicationinshop[];
}
