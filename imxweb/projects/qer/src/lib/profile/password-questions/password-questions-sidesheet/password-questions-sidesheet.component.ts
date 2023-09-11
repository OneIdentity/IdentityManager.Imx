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

import { AfterViewInit, Component, Inject, OnDestroy } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { PortalPasswordquestions } from 'imx-api-qer';

import { ClassloggerService, ConfirmationService, SnackBarService } from 'qbm';
import { PasswordQuestionService } from '../password-question.service';
import { checkMatchValidator } from '../password-questions-validator';
import { ConfirmPasswordMatcher } from '../confirm-password-matcher';

@Component({
  selector: 'imx-password-questions-sidesheet',
  templateUrl: './password-questions-sidesheet.component.html',
  styleUrls: ['./password-questions-sidesheet.component.scss']
})
export class PasswordQuestionsSidesheetComponent implements AfterViewInit, OnDestroy {

  /**
   * The form group to which the created form controls will be added.
   */
  public readonly formGroup: UntypedFormGroup;

  public passwordMatcher: any;
  public ldsHelperTextSavedQuestion = '#LDS#Your saved answer will not be displayed here and will be valid until a new answer is entered and saved. Note that your answer is case-sensitive and that you will have to enter your answer in the same way later.'
  public ldsHelperTextNewQuestion = '#LDS#Note that your answer is case-sensitive and that you will have to enter your answer in the same way later.';
 
  public answerHide = true;
  public confirmAnswerHide = true;

  private readonly subscriptions: Subscription[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public data: {
      passwordQuestion: PortalPasswordquestions
      isNew: boolean,
      deleteMessage: string
    },
    private readonly busy: EuiLoadingService,
    private readonly confirmation: ConfirmationService,
    private readonly logger: ClassloggerService,
    private readonly passwortQuestionService: PasswordQuestionService,
    private readonly sideSheetRef: EuiSidesheetRef,
    private readonly snackbar: SnackBarService,
  ) {
    this.passwordMatcher = new ConfirmPasswordMatcher();

    this.formGroup = new UntypedFormGroup({
      question: new UntypedFormControl(this.data.passwordQuestion.PasswordQuery.value, { updateOn: 'blur', validators: [Validators.required] }),
      answer: new UntypedFormControl('', { updateOn: 'blur', validators: [Validators.required] }),
      confirmAnswer: new UntypedFormControl('', { updateOn: 'blur', validators: [Validators.required] })
    });

    this.subscriptions.push(this.sideSheetRef.closeClicked().subscribe(async () => {
      if (!this.formGroup.dirty
        || await confirmation.confirmLeaveWithUnsavedChanges()) {
        this.sideSheetRef.close(false);
      }
    }));
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public ngAfterViewInit(): void {
    // add the match validator to the formgroup
    this.formGroup.setValidators(checkMatchValidator('answer', 'confirmAnswer'));
  }

  public async save(): Promise<void> {
    if (this.formGroup.valid) {
      this.logger.debug(this, `Saving password query`);
      this.busy.show();
      try {
        this.data.passwordQuestion.PasswordQuery.Column.PutValue(this.formGroup.get('question').value);
        this.data.passwordQuestion.PasswordAnswer.Column.PutValue(this.formGroup.get('answer').value);
        await this.data.passwordQuestion.GetEntity().Commit(true);
        this.formGroup.markAsPristine();
        this.sideSheetRef.close(true);
      } finally {
        this.busy.hide();
      }
    }
  }

  public async delete(): Promise<void> {
    const message = this.data.deleteMessage;

    if (await this.confirmation.confirm({
      Title: '#LDS#Heading Delete Password Question',
      Message: message
    })) {
      this.busy.show();

      try {
        await this.passwortQuestionService.delete(this.data.passwordQuestion);
        this.snackbar.open({ key: '#LDS#The password question has been successfully deleted.' });
      } finally {
        this.busy.hide();
        this.sideSheetRef.close(true);
      }
    }
  }
}
