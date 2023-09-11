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

import { Component, ErrorHandler, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { ColumnDependentReference } from 'qbm';
import { Subscription } from 'rxjs';
import { ColumnConstraints, RequestWorkflowData } from '../approval-workflow.interface';
import { FormDataService } from '../form-data.service';
import { ApprovalWorkflowDataService } from '../approval-workflow-data.service';

@Component({
  selector: 'imx-approval-workflow-form',
  templateUrl: './approval-workflow-form.component.html',
  styleUrls: ['./approval-workflow-form.component.scss'],
})
export class ApprovalWorkflowFormComponent implements OnInit, OnDestroy {
  public readonly formGroup: FormGroup;
  public cdrList: ColumnDependentReference[] = [];
  public isInActiveFormControl = new FormControl();
  public initialState: {
    [key: string]: any
  };

  private readonly subscriptions: Subscription[] = [];

  constructor(
    formBuilder: FormBuilder,
    @Inject(EUI_SIDESHEET_DATA) public requestData: RequestWorkflowData,
    public formService: FormDataService,
    public readonly translate: TranslateService,
    public readonly sidesheetRef: EuiSidesheetRef,
    private approvalWorkFlowDataService: ApprovalWorkflowDataService,
    private errorHandler: ErrorHandler
    ) {
    this.formGroup = new FormGroup({ formArray: formBuilder.array([]) });

    this.subscriptions.push(
      this.sidesheetRef.closeClicked().subscribe(async () => {
        await this.formService.cancelChanges(this.formGroup, this.sidesheetRef, this.requestData);
      })
    );
  }
  get formArray(): FormArray {
    return this.formGroup.get('formArray') as FormArray;
  }

  public async ngOnInit(): Promise<void> {
    const columnConstraints: ColumnConstraints = {
      DaysToAbort: {
        valueConstraint: {
          MinValue: 0
        }
      }
    };
    this.cdrList = this.formService.setup(this.requestData, columnConstraints);
  }

  public async saveChanges(): Promise<void> {
    let closeSheet = true;
    if (this.requestData.SaveBeforeClosing) {
      this.approvalWorkFlowDataService.handleOpenLoader();
      try {
        await this.requestData.Object.GetEntity().Commit(true);
      } catch (error) {
        this.errorHandler.handleError(error);
        closeSheet = false;
      }
      this.approvalWorkFlowDataService.handleCloseLoader();
    }
    if (closeSheet) {
      this.formService.saveChanges(this.formGroup, this.sidesheetRef);
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
