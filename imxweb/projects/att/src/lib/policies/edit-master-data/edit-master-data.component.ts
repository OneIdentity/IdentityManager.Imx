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
import { AbstractControl, UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EUI_SIDESHEET_DATA, EuiLoadingService, EuiSidesheetRef } from '@elemental-ui/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { PolicyFilter } from '@imx-modules/imx-api-att';
import { EntitySchema } from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import {
  BaseCdr,
  BusyService,
  ClassloggerService,
  ColumnDependentReference,
  ConfirmationService,
  HELP_CONTEXTUAL,
  HelpContextualValues,
  LdsReplacePipe,
  SnackBarService,
} from 'qbm';
import { UserModelService } from 'qer';
import { ConfirmDeactivationComponent } from '../confirm-deactivation/confirm-deactivation.component';
import { FilterElementColumnService } from '../editors/filter-element-column.service';
import { FilterModel } from '../policy-editor/filter-model';
import { PolicyEditorComponent } from '../policy-editor/policy-editor.component';
import { Policy } from '../policy.interface';
import { PolicyService } from '../policy.service';

@Component({
  templateUrl: './edit-master-data.component.html',
  styleUrls: ['./edit-master-data.component.scss'],
})
export class EditMasterDataComponent implements OnInit, OnDestroy {
  public readonly formGroup: UntypedFormGroup;
  public readonly schema: EntitySchema;
  public objectProperties: { [key: string]: { cdr: ColumnDependentReference; formControl?: AbstractControl } } = {};
  public readonly formArray: UntypedFormArray;
  public reload = false;
  public filterModel: FilterModel;
  public hasAttestations: boolean;
  public contextId: HelpContextualValues;
  public busyService: BusyService = new BusyService();

  @ViewChild('filterControl', { static: true }) policyEditor: PolicyEditorComponent;

  private valueChangedSubscription: Subscription;
  private closeSubscription: Subscription;
  private threshold = -1;

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly policy: Policy,
    public readonly sidesheetRef: EuiSidesheetRef,
    private readonly euiBusyService: EuiLoadingService,
    private readonly snackBar: SnackBarService,
    private readonly dialog: MatDialog,
    private readonly policyService: PolicyService,
    private readonly columnService: FilterElementColumnService,
    private readonly logger: ClassloggerService,
    private readonly userService: UserModelService,
    private readonly confirmationService: ConfirmationService,
    private readonly translate: TranslateService,
    private readonly ldsReplace: LdsReplacePipe,
  ) {
    this.schema = policyService.AttestationPolicyEditSchema;
    this.initOrRefreshCdrDictionary();

    this.formGroup = new UntypedFormGroup({
      formArray: new UntypedFormArray([]),
    });
    this.formArray = this.formGroup.get('formArray') as UntypedFormArray;
    this.closeSubscription = this.sidesheetRef.closeClicked().subscribe(async () => {
      if (!this.formGroup.dirty || (await confirmationService.confirmLeaveWithUnsavedChanges())) {
        this.sidesheetRef.close(this.reload);
      }
    });

    this.filterModel = new FilterModel(this.columnService, new BehaviorSubject<string>(''));
    this.filterModel.uidAttestationObject = this.policy.policy.UID_AttestationObject.value;
    this.filterModel.policyFilterData = this.policy.filterData;
  }

  public ngOnDestroy(): void {
    if (this.valueChangedSubscription) {
      this.valueChangedSubscription.unsubscribe();
    }
    if (this.closeSubscription) {
      this.closeSubscription.unsubscribe();
    }
  }

  public async onFilterChanged(filter: PolicyFilter) {
    const isBusy = this.busyService.beginBusy();
    try {
      await this.policy.policy.setExtendedData([filter]);
    } finally {
      isBusy.endBusy();
    }
  }

  public get objectType(): string {
    return this.policy.policy.GetEntity().TypeName;
  }

  public get objectUid(): string {
    return this.policy.policy.GetEntity().GetKeys().join(',');
  }

  public async ngOnInit(): Promise<void> {
    if (this.euiBusyService.overlayRefs.length === 0) {
      this.euiBusyService.show();
    }
    try {
      this.hasAttestations = (await this.policyService.getRunCountForPolicy(this.policy.policy.GetEntity().GetKeys()[0])) > 0;
      this.threshold = await this.policyService.getCasesThreshold();
    } finally {
      this.euiBusyService.hide();
    }
    if (this.policy.isNew) {
      this.formGroup.markAsDirty();
    }

    this.contextId = this.policy.isNew ? HELP_CONTEXTUAL.AttestationPoliciesCreate : HELP_CONTEXTUAL.AttestationPoliciesEdit;
  }

  public addControl(evt: AbstractControl, columnName?: string): void {
    setTimeout(() => {
      if (columnName) {
        this.formGroup.removeControl(columnName);
        this.objectProperties[columnName].formControl = evt;
        this.formGroup.addControl(columnName, evt);
        this.logger.debug(this, 'new Control added to form group');

        if (columnName === 'IsInActive') {
          if (this.valueChangedSubscription) {
            this.valueChangedSubscription.unsubscribe();
          }
          this.valueChangedSubscription = evt.valueChanges.subscribe((value) => {
            this.confirmDeactivation(value);
          });
        }
      }
    });
  }

  public updateMethodAndFilter(): void {
    this.objectProperties.UID_PWODecisionMethod.cdr = new BaseCdr(this.policy.policy.UID_PWODecisionMethod.Column);
    this.filterModel.attestationObjectSubject.next(this.policy.policy.UID_AttestationObject.value);
    this.policy.filterData = {
      IsReadOnly: this.policy?.filterData == null || this.policy?.filterData.IsReadOnly,
      Filter: { Elements: [] },
      InfoDisplay: [],
    };
    this.logger.debug(this, 'UID_PWODecisionMethod updated and filter removed');
  }

  public async updateAttestation(): Promise<void> {
    this.objectProperties.Attestators.cdr = new BaseCdr(this.policy.policy.Attestators.Column);
    this.logger.debug(this, 'Attestator cdr updated');
  }

  public async updateReadOnlySchedule() {
    this.objectProperties.UID_DialogSchedule.cdr = new BaseCdr(this.policy.policy.UID_DialogSchedule.Column);
    this.logger.debug(this, 'UID_DialogSchedule cdr updated');
  }

  public async submit(): Promise<void> {
    if (!(await this.confirmCreation())) {
      return;
    }
    if (this.euiBusyService.overlayRefs.length === 0) {
      this.euiBusyService.show();
    }
    try {
      const filter = this.filterModel.policyFilterData?.Filter;

      this.policy.policy.extendedData = !!filter ? [filter] : [];
      await this.policy.policy.GetEntity().Commit(false);
      this.logger.debug(this, 'data submitted');

      this.sidesheetRef.close(true);
    } finally {
      this.euiBusyService.hide();
    }

    this.snackBar.open(
      {
        key: '#LDS#The attestation policy "{0}" has been successfully saved.',
        parameters: [this.policy.policy.GetEntity().GetDisplay()],
      },
      '#LDS#Close',
    );
    this.reload = true;
  }

  public async delete(): Promise<void> {
    if (
      await this.confirmationService.confirm({
        Title: '#LDS#Heading Delete Attestation Policy',
        Message: '#LDS#Are you sure you want to delete the attestation policy?',
      })
    ) {
      await this.policyService.deleteAttestationPolicy(this.policy.policy.GetEntity().GetKeys()[0]);
      this.logger.debug(this, 'policy is deleted');

      this.snackBar.open(
        {
          key: '#LDS#The attestation policy "{0}" has been successfully deleted.',
          parameters: [this.policy.policy.GetEntity().GetDisplay()],
        },
        '#LDS#Close',
      );
      this.sidesheetRef.close(true);
    }
  }

  private async confirmCreation(): Promise<boolean> {
    if (!this.policyEditor?.showWarning) {
      return true;
    }
    const message = this.ldsReplace.transform(
      await this.translate
        .get(
          '#LDS#This attestation policy affects more than {0} objects. Running this attestation policy may take some time and generate notifications to many approvers. Are you sure you want to save the attestation policy?',
        )
        .toPromise(),
      this.threshold,
    );
    return this.confirmationService.confirm({
      Title: '#LDS#Heading Many Objects Affected',
      Message: message,
    });
  }

  private async confirmDeactivation(deativate: boolean): Promise<void> {
    if (!deativate) {
      return;
    }

    const hasPending = this.policy.policy.CountOpenCases.value > 0;
    if (!hasPending) {
      return;
    }

    this.logger.debug(this, 'confirm deactivation of pending policy');

    const ref = this.dialog.open(ConfirmDeactivationComponent, {
      disableClose: true,
      autoFocus: false,
      panelClass: 'imx-messageDialog',
    });
    const result = await ref.afterClosed().toPromise();

    if (result) {
      this.policy.policy.IsInActive.value = false;
      this.objectProperties.IsInActive.cdr = new BaseCdr(this.policy.policy.IsInActive.Column);
      this.logger.debug(this, 'column IsInActive was reseted');
    }
  }

  private initOrRefreshCdrDictionary(refresh: boolean = false): void {
    if (this.policy.policy == null) {
      return;
    }

    const columns = [
      this.policy.policy.Ident_AttestationPolicy.Column,
      this.policy.policy.Description.Column,
      this.policy.policy.UID_AttestationObject.Column,
      this.policy.policy.UID_PWODecisionMethod.Column,
      this.policy.policy.Attestators.Column,
      this.policy.policy.UID_DialogSchedule.Column,
      this.policy.policy.SolutionDays.Column,
      this.policy.policy.UID_PersonOwner.Column,
      this.policy.policy.RiskIndex.Column,
      this.policy.policy.Areas.Column,
      this.policy.policy.UID_AttestationPolicyGroup.Column,
      this.policy.policy.UID_DialogCulture.Column,
      this.policy.policy.IsShowElementsInvolved.Column,
      this.policy.policy.IsInActive.Column,
      this.policy.policy.IsAutoCloseOldCases.Column,
      this.policy.policy.LimitOfOldCases.Column,
      this.policy.policy.IsApproveRequiresMfa.Column,
      this.policy.policy.UID_QERPickCategory.Column,
    ];

    for (const column of columns) {
      if (!column.GetMetadata().CanSee()) {
        continue;
      }
      if (refresh) {
        this.objectProperties[column.ColumnName].cdr = new BaseCdr(column);
      } else {
        this.objectProperties[column.ColumnName] = { cdr: new BaseCdr(column) };
      }
    }
  }

  public LdsKeySampleRemoved =
    '#LDS#The sample assigned to the original attestation policy has been removed for the copy. Samples can be assigned to only one attestation policy at a time.';
}
