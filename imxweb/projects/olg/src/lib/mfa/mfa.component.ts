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

import { AfterContentChecked, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { ActivateFactorData, AuthFactors, VerifyPollingResult } from 'imx-api-olg';
import { ValType } from 'imx-qbm-dbts';
import { BaseCdr, ColumnDependentReference, EntityService } from 'qbm';
import { PortalMfaService } from './portal-mfa.service';

@Component({
  templateUrl: './mfa.component.html',
  styleUrls: ['./mfa.component.scss'],
})
export class MfaComponent implements OnInit, AfterContentChecked {
  public formGroup: FormGroup;

  public authFactors: AuthFactors = { Factors: [] };
  public authCDRs: ColumnDependentReference[] = [];
  public showCDRs: boolean[] = [];

  public activatedFactor: ActivateFactorData;
  public checkingPoll = false;
  public checkingOTP = false;
  private workflowActionId: string;

  constructor(
    private formBuilder: FormBuilder,
    private cdref: ChangeDetectorRef,
    private readonly busyService: EuiLoadingService,

    private readonly mfa: PortalMfaService,
    private readonly entityService: EntityService,
    @Inject(EUI_SIDESHEET_DATA)
    public readonly data: {
      workflowActionId: string;
    },
    private readonly sideSheetRef: EuiSidesheetRef
  ) {
    this.workflowActionId = data.workflowActionId;
    this.formGroup = new FormGroup({ formArray: this.formBuilder.array([]) });
  }

  public isOTP(factorName: string): boolean {
    return ['OneLogin Email', 'SMS'].includes(factorName);
  }

  public isProtect(factorName: string): boolean {
    return factorName === 'OneLogin';
  }

  public isAuthenticator(factorName: string): boolean {
    return factorName === 'Google Authenticator';
  }

  public isCDRValid(cdr: ColumnDependentReference): boolean {
    return cdr.column.GetValue().length > 0;
  }

  public get formArray(): FormArray {
    return this.formGroup.get('formArray') as FormArray;
  }

  public get isActivated(): boolean {
    if (this.activatedFactor) {
      return true;
    }
    return false;
  }

  public async ngOnInit(): Promise<void> {
    this.busyService.show();
    try {
      this.authFactors = await this.mfa.getFactors();
      this.authFactors.Factors.forEach((factor) => {
        this.authCDRs.push(
          new BaseCdr(
            this.entityService.createLocalEntityColumn({
              ColumnName: 'OTP',
              Type: ValType.Text,
              MinLen: 1,
            }),
            '#LDS#One-Time Password'
          )
        );
        this.showCDRs.push(false);
      });
    } finally {
      this.busyService.hide();
    }
  }

  public resetState(index: number): void {
    this.showCDRs.fill(false);
    this.authCDRs[index].column.PutValue('');
    this.activatedFactor = null;
  }

  public ngAfterContentChecked(): void {
    this.cdref.detectChanges();
  }

  public onClose(): void {
    this.sideSheetRef.close();
  }

  public async activateFactor(factorName: string, deviceId: string, index: number): Promise<void> {
    this.busyService.show();
    try {
      this.showCDRs = this.showCDRs.fill(false);
      this.activatedFactor = await this.mfa.activateFactor(this.workflowActionId, deviceId);
      this.showCDRs[index] = true;
      if (this.isProtect(factorName)) {
        this.verifyPoll(index);
      }
    } finally {
      this.busyService.hide();
    }
  }

  public async verifyWithOTP(index: number): Promise<void> {
    this.checkingOTP = true;
    try {
      const result = await this.mfa.verifyWithVerificationId(
        this.workflowActionId,
        this.activatedFactor.id,
        this.authCDRs[index].column.GetValue()
      );
      if (result) {
        this.sideSheetRef.close(true);
      } else {
        this.resetState(index);
      }
    } finally {
      this.checkingOTP = false;
    }
  }

  public async verifyWithOTPAndDevice(index: number): Promise<void> {
    this.checkingOTP = true;
    try {
      const result = await this.mfa.verifyWithVerificationId(
        this.workflowActionId,
        this.activatedFactor.id,
        this.authCDRs[index].column.GetValue(),
        this.activatedFactor.device_id
      );
      if (result) {
        this.sideSheetRef.close(true);
      } else {
        this.resetState(index);
      }
    } finally {
      this.checkingOTP = false;
    }
  }

  public async verifyPoll(index: number): Promise<void> {
    this.checkingPoll = true;
    try {
      const pollResult = await this.mfa.verifyWithPolling(this.workflowActionId, this.activatedFactor.id);
      if (pollResult === VerifyPollingResult.Accepted) {
        this.sideSheetRef.close(true);
      } else {
        this.resetState(index);
      }
    } finally {
      this.checkingPoll = false;
    }
  }
}
