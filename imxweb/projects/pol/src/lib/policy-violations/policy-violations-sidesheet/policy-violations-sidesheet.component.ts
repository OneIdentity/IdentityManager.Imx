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
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';

import { ColumnDependentReference } from 'qbm';
import { PolicyViolation } from '../policy-violation';
import { PolicyViolationsService } from '../policy-violations.service';
import { ObjectInfo } from 'imx-api-pol';
import { DbObjectKey } from 'imx-qbm-dbts';

@Component({
  selector: 'imx-policy-violations-sidesheet',
  templateUrl: './policy-violations-sidesheet.component.html',
  styleUrls: ['./policy-violations-sidesheet.component.scss']
})
export class PolicyViolationsSidesheetComponent {

  public cdrList: ColumnDependentReference[] = [];
  public selectedHyperviewType: string;
  public selectedHyperviewUID: string;
  public selectedOption: ObjectInfo

  public get isPending(): boolean {
    return this.data.policyViolation.State.value?.toLocaleLowerCase() === 'pending';
  }

  public get objectType(): string {
    return this.data.policyViolation.GetEntity().TypeName;
  }

  public get objectUid(): string {
    return this.data.policyViolation.GetEntity().GetKeys().join(',');
  }

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public data: {
      policyViolation: PolicyViolation;
      isMControlPerViolation: boolean;
      isReadOnly: boolean;
    },
    private readonly policyViolationService: PolicyViolationsService,
    public readonly sideSheetRef: EuiSidesheetRef
  ) {
    this.cdrList = this.data.policyViolation.properties;
  }

  /**
   * Opens the Approve-Sidesheet for the current selected rules violations and closes the sidesheet afterwards.
   */
  public async approve(): Promise<void> {
    await this.policyViolationService.approve([this.data.policyViolation]);
    return this.sideSheetRef.close(true);
  }

  /**
   * Opens the Deny-Sidesheet for the current selected rules violations and closes the sidesheet afterwards.
   */
  public async deny(): Promise<void> {
    await this.policyViolationService.deny([this.data.policyViolation]);
    return this.sideSheetRef.close(true);
  }

  public get relatedOptions(): ObjectInfo[]{
    return this.data.policyViolation.data || [];
  }

  public setHyperviewObject(selectedRelatedObject: ObjectInfo): void{
    const dbKey = DbObjectKey.FromXml(selectedRelatedObject.ObjectKey);
    this.selectedHyperviewType = dbKey.TableName;
    this.selectedHyperviewUID = dbKey.Keys.join(',');
  }

  public onHyperviewOptionSelected(): void {
    this.setHyperviewObject(this.selectedOption)
  }
}
