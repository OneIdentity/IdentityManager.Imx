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
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { EuiLoadingService, EuiSidesheetRef } from '@elemental-ui/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { EntitySchema, IClientProperty } from 'imx-qbm-dbts';
import { ConfirmationService, MultiSelectFormcontrolComponent } from 'qbm';
import { ReportSubscription } from '../report-subscription/report-subscription';
import { ReportSubscriptionService } from '../report-subscription/report-subscription.service';

@Component({
  selector: 'imx-subscription-wizard',
  templateUrl: './subscription-wizard.component.html',
  styleUrls: ['./subscription-wizard.component.scss']
})
export class SubscriptionWizardComponent implements OnDestroy {

  public readonly reportFormGroup = new UntypedFormGroup({
    reportTable: new UntypedFormControl(undefined, Validators.required)
  });
  public readonly reportParameterFormGroup = new UntypedFormGroup({});
  public readonly additionalSubscribersFormGroup = new UntypedFormGroup({
    additionalSubscribers: new UntypedFormControl(undefined)
  });
  public isLoadingOverview = false;
  public newSubscription: ReportSubscription;
  public readonly entitySchema: EntitySchema;
  public subscribersChangedSubject = new BehaviorSubject<void>(undefined);
  public columnsForEdit: IClientProperty[];

  @ViewChild('additionalApprover') private additional: MultiSelectFormcontrolComponent;

  private closeClickSubscription: Subscription;

  constructor(
    public readonly sidesheetRef: EuiSidesheetRef,
    private readonly reportSubscriptionService: ReportSubscriptionService,
    private readonly confirmation: ConfirmationService,
    private readonly busyService: EuiLoadingService,
  ) {
    this.entitySchema = reportSubscriptionService.PortalSubscriptionInteractiveSchema;
    this.columnsForEdit = [
      this.entitySchema.Columns.Ident_RPSSubscription,
      this.entitySchema.Columns.UID_DialogSchedule,
      this.entitySchema.Columns.ExportFormat,
    ];
    this.closeClickSubscription = this.sidesheetRef.closeClicked().subscribe(async () => {
      if ((!this.reportFormGroup.dirty && !this.reportParameterFormGroup.dirty && !this.additionalSubscribersFormGroup.dirty)
        || await this.confirmation.confirmLeaveWithUnsavedChanges()) {
        this.sidesheetRef.close(false);
      }
    });
  }

  public ngOnDestroy(): void {
    this.closeClickSubscription.unsubscribe();
  }

  public async selectedStepChanged(event: StepperSelectionEvent): Promise<void> {
    if (event.selectedIndex === 1 && event.previouslySelectedIndex === 0) {
      let overlayRef: OverlayRef;
      setTimeout(() => overlayRef = this.busyService.show());
      try {
        this.newSubscription =
          await this.reportSubscriptionService.createNewSubscription(this.reportFormGroup.get('reportTable').value);
        this.additionalSubscribersFormGroup.get('additionalSubscribers')
          .setValue(this.newSubscription.subscription.AddtlSubscribers.Column);

      } finally {
        setTimeout(() => this.busyService.hide(overlayRef));
      }
    }

    if (event.selectedIndex === 3) {
      this.isLoadingOverview = true;
      await this.additional.pushValue();
      this.isLoadingOverview = false;
      this.subscribersChangedSubject.next();
    }
  }

  public async submit(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      await this.newSubscription.submit();
      this.newSubscription.unsubscribeEvents();
      this.sidesheetRef.close(true);
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }
}
