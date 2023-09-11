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

import { OverlayRef } from '@angular/cdk/overlay';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EuiLoadingService, EuiSidesheetRef } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { RegisterPerson } from 'imx-api-att';
import { CaptchaService, ColumnDependentReference, ConfirmationService, ErrorService, ParameterizedText, UserMessageService, CdrFactoryService } from 'qbm';

import { ApiService } from '../api.service';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Component({
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.scss']
})
export class NewUserComponent implements OnInit, OnDestroy {

  public readonly profileForm: UntypedFormGroup;
  public busy = false;
  public person: RegisterPerson;

  public cdrList: ColumnDependentReference[] = [];

  public ldsCaptchaInfo = '#LDS#Please enter the characters from the image.';
  public ldsAccountInfo = '#LDS#Your account "%CentralAccount%" has been successfully created and the email address "%DefaultEmailAddress%" has been assigned to the account. Once your account is approved, it will be activated.';

  private disposable: () => void;
  private readonly subscriptions: Subscription[] = [];

  constructor(
    public readonly captchaSvc: CaptchaService,
    private readonly attApiClient: ApiService,
    private readonly busyService: EuiLoadingService,
    private readonly cd: ChangeDetectorRef,
    private readonly dialog: MatDialog,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly messageSvc: UserMessageService,
    private readonly translate: TranslateService,
    private readonly cdrFactoryService: CdrFactoryService,
    errorService: ErrorService,
    formBuilder: UntypedFormBuilder,
    confirmation: ConfirmationService
  ) {
    this.profileForm = new UntypedFormGroup({ formArray: formBuilder.array([]) });
    this.disposable = errorService.setTarget('sidesheet');

    this.subscriptions.push(this.sidesheetRef.closeClicked().subscribe(async (result) => {
      if (!this.profileForm.pristine) {
        const close = await confirmation.confirmLeaveWithUnsavedChanges();
        if (close) {
          this.sidesheetRef.close();
        }
      } else {
        this.sidesheetRef.close(result);
      }
    }));
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.disposable();
  }
  public async ngOnInit(): Promise<void> {
    this.person = this.attApiClient.typedClient.RegisterPerson.createEntity();

    try {
      const data = await this.attApiClient.client.register_config_get();
      this.cdrList =this.cdrFactoryService.buildCdrFromColumnList(this.person.GetEntity(),data.WritablePropertiesForUnregisteredUsers);
    } finally {
      this.busy = false;
      this.cd.detectChanges();
    }
  }

  public async save(): Promise<void> {
    // reset the error message
    this.messageSvc.subject.next(undefined);

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      // use response code
      this.person.extendedData = { Code: this.captchaSvc.Response };
      this.captchaSvc.Response = '';
      await this.person.GetEntity().Commit(true);
      this.profileForm.markAsPristine();

      const template = await this.translate.get(this.ldsAccountInfo).toPromise();
      const parameterizedText: ParameterizedText = {
        value: template,
        marker: { start: '"%', end: '%"' },
        getParameterValue: columnName => this.person.GetEntity().GetColumn(columnName).GetDisplayValue()
      };
      this.sidesheetRef.close();
      this.disposable();
      this.dialog.open(ConfirmDialogComponent, { data: parameterizedText });

    } catch (e) {
      throw e;
    } finally {
      this.captchaSvc.ReinitCaptcha();
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }
}
