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
 * Copyright 2022 One Identity LLC.
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

import { ExceptionData, RequestableProductForPerson } from 'imx-api-qer';

/**
 * Class representing the service items that could not be added to the itshop pattern.
 */
export class DuplicatePatternItem implements RequestableProductForPerson {

  // tslint:disable-next-line: variable-name
  public readonly UidITShopOrg: string;

  // tslint:disable-next-line: variable-name
  public readonly Display: string;

  // tslint:disable-next-line: variable-name
  public readonly DisplayRecipient: string;

  public readonly error: string;

  constructor(product: RequestableProductForPerson, public readonly errorMessage: ExceptionData) {
    this.UidITShopOrg = product.UidITShopOrg;
    this.Display = product.Display;
    this.DisplayRecipient = product.DisplayRecipient;
    this.error = errorMessage.Message;
  }
}
