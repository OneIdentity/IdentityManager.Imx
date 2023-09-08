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

import { ICartItemCheck } from 'imx-api-qer';

export enum CartItemValidationStatus {
  pending = 0,
  success = 1,
  warning = 2,
  error = 3,
  disabled = 4
}

export function getCartItemValidationStatus(check: ICartItemCheck): { status: string, icon: string } {
  switch (check.Status as CartItemValidationStatus) {
    case CartItemValidationStatus.disabled: return { status: 'Disabled', icon: 'location_disabled' };
    case CartItemValidationStatus.error: return { status: 'Error', icon: 'cancel' };
    case CartItemValidationStatus.pending: return { status: 'Pending', icon: 'hourglass_empty' };
    case CartItemValidationStatus.success: return { status: 'Success', icon: 'done' };
    case CartItemValidationStatus.warning: return { status: 'Warning', icon: 'warning' };
  }
}
