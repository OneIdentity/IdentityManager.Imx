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

import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EUI_SIDESHEET_DATA, EuiLoadingService, EuiSelectOption, EuiSidesheetRef } from '@elemental-ui/core';

import { FormControl } from '@angular/forms';
import { DbObjectKey } from '@imx-modules/imx-qbm-dbts';
import { ColumnDependentReference, ConfirmationService } from 'qbm';
import { Subscription } from 'rxjs';
import { MitigatingControlsComponent } from '../mitigating-controls/mitigating-controls.component';
import { PolicyViolation } from '../policy-violation';
import { PolicyViolationsService } from '../policy-violations.service';

@Component({
  selector: 'imx-policy-violations-sidesheet',
  templateUrl: './policy-violations-sidesheet.component.html',
  styleUrls: ['./policy-violations-sidesheet.component.scss'],
})
export class PolicyViolationsSidesheetComponent implements OnInit, OnDestroy {
  public cdrList: ColumnDependentReference[] = [];
  public selectedHyperviewType: string;
  public selectedHyperviewUID: string;
  public selectedHyperviewOption = new FormControl<string>('', {nonNullable: true});
  public hyperviewOptions: EuiSelectOption[];
  public result: boolean = false;
  public closeSubscription: Subscription;

  public get isPending(): boolean {
    return this.data.policyViolation.State.value?.toLocaleLowerCase() === 'pending';
  }

  public get objectType(): string {
    return this.data.policyViolation.GetEntity().TypeName;
  }

  public get objectUid(): string {
    return this.data.policyViolation.GetEntity().GetKeys().join(',');
  }

  @ViewChild('mitig') mitig: MitigatingControlsComponent;

  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    public data: {
      policyViolation: PolicyViolation;
      isMControlPerViolation: boolean;
      isReadOnly: boolean;
    },
    private readonly policyViolationService: PolicyViolationsService,
    public readonly sideSheetRef: EuiSidesheetRef,
    private readonly confirmationService: ConfirmationService,
    private readonly euiLoadingService: EuiLoadingService,
  ) {}
  
  ngOnInit() {
    this.cdrList = this.data.policyViolation.properties;
    this.closeSubscription = this.sideSheetRef.closeClicked().subscribe(async () => {
      if (!this.mitig.isDirty || (await this.confirmationService.confirmLeaveWithUnsavedChanges())) {
        this.sideSheetRef.close(this.result);
      }
    });
    this.hyperviewOptions = this.data.policyViolation.data.map(option => {
      return {
        display: option.Display!,
        value: option.ObjectKey
      }
    });
    // Prepopulate with first entry
    if (this.hyperviewOptions.length > 0) {
      const initValue = this.hyperviewOptions[0].value;
      this.selectedHyperviewOption.setValue(initValue);
      this.setHyperviewObject(initValue);
    }

  }

  public ngOnDestroy(): void {
    this.closeSubscription?.unsubscribe();
  }

  /**
   * Opens the Approve-Sidesheet for the current selected rule violations.
   */
  public async approve(): Promise<void> {
    if (await this.policyViolationService.approve([this.data.policyViolation])) {
      return this.reloadData();
    }
  }

  /**
   * Opens the Deny-Sidesheet for the current selected rule violations.
   */
  public async deny(): Promise<void> {
    if (await this.policyViolationService.deny([this.data.policyViolation])) {
      return this.reloadData();
    }
  }

  /**
   * Setup for the hyperview component
   * @param objectKey 
   */
  public setHyperviewObject(objectKey: string | undefined): void {
    const dbKey = DbObjectKey.FromXml(objectKey ?? '');
    this.selectedHyperviewType = dbKey.TableName;
    this.selectedHyperviewUID = dbKey.Keys.join(',');
  }

  /**
   * Handle changes to the hyperview option
   * @param option 
   */
  public onHyperviewOptionSelected(option: EuiSelectOption): void {
    this.setHyperviewObject(option.value);
  }

  private async reloadData() {
    this.result = true;
    this.euiLoadingService.show();
    try {
      const value = await this.policyViolationService.get(true, {
        filter: [{ ColumnName: 'ObjectKey', Value1: this.data.policyViolation.ObjectKey.value }],
      });
      this.data.policyViolation = value.Data[0];
      this.cdrList = this.data.policyViolation.properties;
    } finally {
      this.euiLoadingService.hide();
    }
  }
}
