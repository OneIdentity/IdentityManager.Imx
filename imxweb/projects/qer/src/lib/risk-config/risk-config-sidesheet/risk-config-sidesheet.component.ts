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

import { Component, Inject, OnDestroy } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { PortalRiskFunctions, RiskIndexExtendedData, RiskIndexSourceTable } from 'imx-api-qer';
import { IEntity } from 'imx-qbm-dbts';
import { BaseCdr, ColumnDependentReference, ConfirmationService, SnackBarService } from 'qbm';
import { Subscription } from 'rxjs';
import { RiskConfigService } from '../risk-config.service';

@Component({
  selector: 'imx-risk-config-sidesheet',
  templateUrl: './risk-config-sidesheet.component.html',
  styleUrls: ['./risk-config-sidesheet.component.scss'],
})
export class RiskConfigSidesheetComponent implements OnDestroy {
  public readonly formGroup = new UntypedFormGroup({});
  public cdrList: ColumnDependentReference[] = [];
  public isInActiveFormControl = new UntypedFormControl();

  private readonly subscriptions: Subscription[] = [];
  constructor(
    private riskConfigEditService: RiskConfigService,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly snackbar: SnackBarService,
    confirmation: ConfirmationService,
    @Inject(EUI_SIDESHEET_DATA) public data: { riskFunction: PortalRiskFunctions; extendedData: RiskIndexExtendedData }
  ) {
    const entity = data.riskFunction.GetEntity();
    this.subscriptions.push(
      this.sidesheetRef.closeClicked().subscribe(async () => {
        if (
          (entity.GetDiffData()?.Data?.length > 0 || !this.formGroup.pristine) &&
          !(await confirmation.confirmLeaveWithUnsavedChanges())
        ) {
          return;
        }
        this.sidesheetRef.close();
      })
    );
    this.cdrList = this.createCdrList(entity);
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public async saveChanges(): Promise<void> {
    if (this.formGroup.valid) {
      this.riskConfigEditService.handleOpenLoader();
      let confirmMessage = '#LDS#The risk index function has been successfully saved.';
      try {
        await this.data.riskFunction.GetEntity().Commit(true);
        this.formGroup.markAsPristine();
        this.sidesheetRef.close(true);
        this.snackbar.open({ key: confirmMessage });
      } finally {
        this.riskConfigEditService.handleCloseLoader();
      }
    }
  }

  public getRiskIndexDataSource(): RiskIndexSourceTable[] {
    return this.data.extendedData?.Sources?.[0];
  }

  private createCdrList(entity: IEntity): BaseCdr[] {
    const cdrList = [];
    const columnNames: string[] = ['TargetTable', 'Description', 'IsExecuteImmediate', 'IsInActive', 'TypeOfCalculation', 'Weight'];
    columnNames?.forEach((name) => {
      try {
        cdrList.push(new BaseCdr(entity.GetColumn(name)));
      } catch {}
    });
    return cdrList;
  }
}
