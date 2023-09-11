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

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { ColumnDependentReference } from 'qbm';
import { Subscription } from 'rxjs';
import { ColumnConstraints, RequestLevelData } from '../approval-workflow.interface';
import { FormDataService } from '../form-data.service';

@Component({
  selector: 'imx-approval-level-form',
  templateUrl: './approval-level-form.component.html',
  styleUrls: ['./approval-level-form.component.scss']
})
export class ApprovalLevelFormComponent implements OnInit, OnDestroy {
  public readonly formGroup: FormGroup;
  public cdrList: ColumnDependentReference[] = [];
  public isInActiveFormControl = new FormControl();
  public initialState: {
    [key: string]: any
  };

  private readonly subscriptions: Subscription[] = [];

  constructor(
    formBuilder: FormBuilder,
    @Inject(EUI_SIDESHEET_DATA) public requestData: RequestLevelData,
    public formService: FormDataService,
    public sidesheetRef: EuiSidesheetRef,
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
      LevelDisplay: {
        minLength: 1
      }
    };
    this.cdrList = await this.formService.setup(this.requestData, columnConstraints);
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
