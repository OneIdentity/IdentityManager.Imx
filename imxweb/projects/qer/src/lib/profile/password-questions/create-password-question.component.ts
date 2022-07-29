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

import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { EuiLoadingService, EuiSidesheetRef, EuiSidesheetService } from '@elemental-ui/core';
import { ConfirmationService } from 'qbm';
import { PasswordQuestionService } from './password-question.service';
import { checkMatchValidator } from './password-questions-validator';

@Component({
  selector: 'imx-create-password-question',
  templateUrl: './create-password-question.component.html',
  styleUrls: ['./create-password-question.component.scss']
})
export class CreatePasswordQuestionComponent {
  public questionForm = this.fb.group({
    question: ['', Validators.required],
    answer: ['', Validators.required],
    retypeAnswer: ['', Validators.required],
  },
  {
    validator: checkMatchValidator('answer', 'retypeAnswer'),
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly api: PasswordQuestionService,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly confirmation: ConfirmationService,
    private readonly busy: EuiLoadingService,
    private readonly sidesheetService: EuiSidesheetService) {
    this.sidesheetRef.closeClicked().subscribe(async () => {
      this.closeSidesheet();
    });
   }

  public async onSubmit(): Promise<void> {
    const item = this.api.create();
    item.GetEntity().GetColumn('PasswordQuery').PutValue(this.questionForm.get('question').value);
    item.GetEntity().GetColumn('PasswordAnswer').PutValue(this.questionForm.get('answer').value);

    this.busy.show();
    try {
      await this.api.post(item);
    } finally {
      this.busy.hide();
      this.sidesheetService.close();
    }
  }

  public async closeSidesheet(): Promise<void> {
    if (this.questionForm.dirty) {
      if (await this.confirmation.confirmLeaveWithUnsavedChanges()) {
        this.sidesheetService.close();
      }
    } else {
      this.sidesheetService.close();
    }
  }

}
