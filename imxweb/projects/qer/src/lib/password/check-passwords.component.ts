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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, Inject, OnDestroy } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, UntypedFormControl, UntypedFormGroup, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { EUI_SIDESHEET_DATA, EuiLoadingService, EuiSidesheetRef } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { PolicyValidationResult } from '@imx-modules/imx-api-qer';
import { ConfirmationService, SnackBarService } from 'qbm';
import { PasswordHelper } from './password-helper';
import { PasswordService } from './password.service';

@Component({
  templateUrl: './check-passwords.component.html',
  styleUrls: ['./check-passwords.component.scss'],
})
export class CheckPasswordsComponent implements OnDestroy {
  public get passwordRepeatControl(): AbstractControl | null {
    return this.passwordForm.get('passwordRepeat');
  }

  public get passwordControl(): AbstractControl | null {
    return this.passwordForm.get('password');
  }

  public passwordHide = true;
  public passwordRepeatHide = true;

  public passwordForm: UntypedFormGroup;

  private closeClickSubscription: Subscription;

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly passwordHelper: PasswordHelper,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly snackBar: SnackBarService,
    private readonly busyService: EuiLoadingService,
    private readonly confirmation: ConfirmationService,
    private passwordSvc: PasswordService,
    private router: Router,
  ) {
    this.passwordForm = new UntypedFormGroup(
      {
        password: new UntypedFormControl('', {
          asyncValidators: CheckPasswordsComponent.validateOnServer(this.passwordSvc, this.passwordHelper),
          updateOn: 'blur',
        }),
        passwordRepeat: new UntypedFormControl('', {
          updateOn: 'blur',
        }),
      },
      {
        validators: CheckPasswordsComponent.sameValue(),
        updateOn: 'blur',
      },
    );
    this.closeClickSubscription = this.sidesheetRef.closeClicked().subscribe(async () => {
      if (!this.passwordForm.dirty || (await this.confirmation.confirmLeaveWithUnsavedChanges())) {
        this.sidesheetRef.close();
      }
    });
  }

  public ngOnDestroy(): void {
    this.closeClickSubscription.unsubscribe();
  }

  public async savePassword(): Promise<void> {
    let overlayRef: OverlayRef;
    if (this.busyService.overlayRefs.length === 0) {
      this.busyService.show();
    }

    let results: PolicyValidationResult[];
    try {
      results = await this.passwordSvc.postOrCheckPassword(
        {
          NewPassword: this.passwordControl?.value,
          CheckOnly: false,
          Ids: this.passwordHelper.selectedPassword.Id != null ? [this.passwordHelper.selectedPassword.Id] : undefined,
        },
        this.passwordHelper.uidPerson,
      );
    } finally {
      this.busyService.hide();
    }

    if (results.length === 0) {
      this.sidesheetRef.close();
      this.snackBar.open({ key: '#LDS#Your password has been successfully changed.' });
      if (!this.passwordHelper.embedded) this.router.navigate(['']);
    } else {
      this.passwordControl?.setErrors({ checkResult: results });
    }
  }

  public isSamePassword(): boolean {
    const passwordValue = this.passwordControl?.value;
    const passwordRepeatValue = this.passwordRepeatControl?.value;

    return passwordValue === passwordRepeatValue;
  }

  private static validateOnServer(svc: PasswordService, helper: PasswordHelper): AsyncValidatorFn {
    return async (control: UntypedFormControl): Promise<{ [key: string]: PolicyValidationResult[] } | null> => {
      const value = control.value;

      if (value == null) {
        return null;
      }

      let check: PolicyValidationResult[];

      helper.isValidating = true;
      try {
        check = await svc.postOrCheckPassword(
          {
            NewPassword: value,
            CheckOnly: true,
            Ids: helper.selectedPassword.Id != null ? [helper.selectedPassword.Id] : undefined,
          },
          helper.uidPerson,
        );
      } finally {
        helper.isValidating = false;
      }

      return check != null && check.length === 0 ? null : { checkResult: check };
    };
  }

  private static sameValue(): ValidatorFn {
    return (control: UntypedFormGroup): { [key: string]: boolean } | null => {
      const passwordValue = control.get('password')?.value;
      const passwordRepeatValue = control.get('passwordRepeat')?.value;

      if (passwordValue !== '' && passwordRepeatValue === '') {
        return null;
      }
      return passwordValue === passwordRepeatValue ? null : { notSameValue: true };
    };
  }
}
