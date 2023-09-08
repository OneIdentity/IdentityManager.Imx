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

import { PasswordItemData, PasswordItemsData, PolicyInfo } from 'imx-api-qer';

export class PasswordHelper {

  public passwordItemData: PasswordItemsData;

  public uidPerson: string;
  public embedded: boolean;
  public selectedPassword: PasswordItemData;
  public selectedPolicy: PolicyInfo;

  public isValidating: boolean;

  public hasCentralPassword(): boolean {
    return this.passwordItemData && 0 < this.passwordItemData.Items.filter(i => i.IsCentralPassword).length;
  }

  public selectItem(item: PasswordItemData): void {
    this.selectedPassword = item;
    this.selectedPolicy = this.passwordItemData.Policies.filter(p => p.PolicyName === item.PolicyName)[0];
  }

  public getManagedByCentralPwd(): PasswordItemData[] {
    if (!this.passwordItemData)
      return [];
    return this.passwordItemData.Items.filter(i => i.IsManagedCentrally);
  }
}
