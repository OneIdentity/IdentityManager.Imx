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

import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { PortalPasswordquestions, UserConfig } from 'imx-api-qer';
import { CollectionLoadParameters, ExtendedTypedEntityCollection } from 'imx-qbm-dbts';
import { ConfirmationService, LdsReplacePipe, SnackBarService } from 'qbm';
import { UserModelService } from '../../user/user-model.service';
import { CreatePasswordQuestionComponent } from './create-password-question.component';
import { PasswordQuestionService } from './password-question.service';
import { checkMatchValidator } from './password-questions-validator';

@Component({
  selector: 'imx-password-questions',
  templateUrl: './password-questions.component.html',
  styleUrls: ['./password-questions.component.scss'],
})
export class PasswordQuestionsComponent implements OnInit {
  public PwdQuestionMode = PwdQuestionMode;
  public userConfig: UserConfig;
  public items: ExtendedTypedEntityCollection<PortalPasswordquestions, unknown>;
  public fgs: FormGroup[] = [];
  public navigationState: CollectionLoadParameters = {
    PageSize: 1000,
    StartIndex: 0,
  };
  public totalCount = 0;

  @ViewChild(MatAccordion) public accordion: MatAccordion;

  constructor(
    private readonly api: PasswordQuestionService,
    private readonly userService: UserModelService,
    private readonly fb: FormBuilder,
    private readonly sidesheetService: EuiSidesheetService,
    private readonly snackbar: SnackBarService,
    private readonly confirmation: ConfirmationService,
    private readonly translate: TranslateService,
    private readonly ldsReplace: LdsReplacePipe,
    private readonly busy: EuiLoadingService,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.userConfig = await this.userService.getUserConfig();
    await this.getData();
  }

  public async getData(): Promise<void> {
    this.busy.show();

    try {
      this.items = await this.api.get(this.navigationState);
      this.totalCount = this.items.totalCount;

      this.fgs = [];
      this.items.Data.forEach((item) => {
        const fg = this.fb.group(
          {
            question: [item.GetEntity().GetColumn('PasswordQuery').GetDisplayValue(), Validators.required],
            answer: ['', Validators.required],
            retypeAnswer: ['', Validators.required],
            id: [item.GetEntity().GetKeys()[0]],
            mode: PwdQuestionMode.View,
            item: item,
          },
          {
            validator: checkMatchValidator('answer', 'retypeAnswer'),
          }
        );

        this.fgs.push(fg);
      });
    } finally {
      this.busy.hide();
    }
  }

  public async onSubmit(fg: FormGroup, index: number): Promise<void> {
    const selectedItem = this.items.Data[index];
    selectedItem.GetEntity().GetColumn('PasswordQuery').PutValue(fg.get('question').value);
    selectedItem.GetEntity().GetColumn('PasswordAnswer').PutValue(fg.get('answer').value);

    this.busy.show();

    try {
      await this.api.put(selectedItem);
      this.snackbar.open({ key: '#LDS#The password question has been successfully saved.' });
      this.onCancel(fg);
    } finally {
      this.busy.hide();
    }
  }

  public onEdit(fg: FormGroup): void {
    fg.get('mode').setValue(PwdQuestionMode.Edit);
  }

  public onCancel(fg: FormGroup): void {
    fg.get('mode').setValue(PwdQuestionMode.View);
    fg.get('answer').setValue('');
    fg.get('retypeAnswer').setValue('');
    fg.markAsPristine();
  }

  public async onCreate(): Promise<void> {
    const sidesheetRef = this.sidesheetService.open(CreatePasswordQuestionComponent, {
      title: await this.translate.get('#LDS#Heading Create Password Question').toPromise(),
      disableClose: true,
      width: '600px',
      headerColour: 'blue',
      padding: '0px',
    });

    sidesheetRef.afterClosed().subscribe(async () => {
      await this.getData();
    });
  }

  public async onDelete(index: number): Promise<void> {
    const message =
      this.totalCount <= this.userConfig.RequiredPasswordQuestions
        ? this.ldsReplace.transform(
          await this.translate.get(
            '#LDS#If you delete this password question, you no longer have enough password questions and must create a new password question. You need at least {0} active password questions. Are you sure you want to delete this password question?'
          ).toPromise(),
          this.userConfig.RequiredPasswordQuestions
        )
        : await this.translate.get(
          '#LDS#Are you sure you want to delete this password question?')
          .toPromise();

    if (await this.confirmation.confirm({
      Title: '#LDS#Heading Delete Password Question',
      Message: message
    })) {
      this.busy.show();

      try {
        await this.api.delete(this.items.Data[index]);
        this.snackbar.open({ key: '#LDS#The password question has been successfully deleted.' });
      } finally {
        this.busy.hide();
        this.getData();
      }
    }
  }
}

export enum PwdQuestionMode {
  View,
  Edit,
}
