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

import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { MessageDialogComponent, LdsReplacePipe, ConfirmationService } from 'qbm';
import { PasswordresetPasswordquestions } from 'imx-api-qer';
import { QerApiService } from '../qer-api-client.service';
import { Title } from '@angular/platform-browser';

// ToDo later: Komponente einbinden und anpassen
@Component({
  templateUrl: './password-query.component.html',
  selector: 'imx-password-query',
})
export class PasswordQueryComponent implements OnInit {
  /** Minimum number of required questions */
  public requiredQuestions: number;

  public questions: PasswordresetPasswordquestions[] = [];
  constructor(
    public readonly translate: TranslateService,
    private readonly qerApiService: QerApiService,
    public readonly ldsReplace: LdsReplacePipe,
    private readonly confirmationService: ConfirmationService,
    private snackBar: MatSnackBar,
    private dialogService: MatDialog,
    private router: Router
  ) { }

  public async ngOnInit(): Promise<void> {
    this.questions = (await this.qerApiService.typedClient.PasswordresetPasswordquestions.Get({ PageSize: 1024 })).Data;
  }

  public hasNotEnoughQuestions(): boolean {
    return this.requiredQuestions > this.questions.filter((a) => !a.IsLocked.value).length;
  }

  public addQuestion(): void {
    const newQuestion: PasswordresetPasswordquestions = this.qerApiService.typedClient.PasswordresetPasswordquestions.createEntity();
    newQuestion.SortOrder.value = this.questions.map((q) => q.SortOrder.value).reduce((x, y) => (x > y ? x : y)) + 1;
    this.questions.push(newQuestion);
  }

  public async save(): Promise<void> {
    if (this.requiredQuestions > this.questions.filter((x) => x.IsLocked.value).length) {
      // Not enough questions
      this.dialogService.open(MessageDialogComponent, {
        data: {
          ShowOk: true,
          Title: await this.translate.get('#LDS#Save password questions').toPromise(),
          // tslint:disable-next-line: max-line-length
          Message: await this.translate
            .get(
              '#LDS#You cannot save your password questions. You have not set up any or not enough password questions and answers. Please add more password questions.'
            )
            .toPromise(),
        },
        panelClass: 'imx-messageDialog',
      });
    } else if (this.questions.filter((x) => !x.IsLocked.value && (!x.PasswordAnswer || !x.PasswordQuery))) {
      this.dialogService.open(MessageDialogComponent, {
        data: {
          ShowOk: true,
          Title: await this.translate.get('#LDS#Save password questions').toPromise(),
          // tslint:disable-next-line: max-line-length
          Message: await this.translate
            .get(
              '#LDS#You cannot save your password questions. The password questions are incomplete. Please edit the password questions and complete the information.'
            )
            .toPromise(),
        },
        panelClass: 'imx-messageDialog',
      });
    } else {
      for (const q of this.questions) {
        await q.GetEntity().Commit(true);
      }

      this.snackBar.open(
        await await this.translate.get('#LDS#You have successfully updated your password questions and answers.').toPromise()
      );
      // TODO: use routeConfig.start from AppConfig
      this.router.navigate(['start']);
    }
  }

  public async UnlockQuestion(q: PasswordresetPasswordquestions): Promise<void> {
    if (await this.confirmationService.confirm({
      Title: '#LDS#Unlock password question',
      Message: '#LDS#Are you sure you want to unlock this password question?'
    })) {
      //  call customizer method unlock for the current
      await this.qerApiService.client.passwordreset_passwordquestions_unlock_post(q.GetEntity().GetKeys()[0]);
      // TODO: later client-side set IsLocked=false, or reload?
    }
  }

  public async Delete(x: PasswordresetPasswordquestions): Promise<void> {
    if (this.questions.filter((m) => m.IsLocked.value).length > this.requiredQuestions) {

      if (await this.confirmationService.confirm({
        Title: '#LDS#Delete password question',
        Message: '#LDS#Are you sure you want to delete this password question?'
      })) {
        // TODO later x.Delete();
      }
    } else {
      this.dialogService.open(MessageDialogComponent, {
        data: {
          ShowOk: true,
          Title: await this.translate.get('#LDS#Delete password question').toPromise(),
          Message: this.ldsReplace.transform(
            await this.translate
              .get('#LDS#You cannot delete this password question. There must be at least {0} active password questions.')
              .toPromise(),
            this.requiredQuestions
          ),
        },
        panelClass: 'imx-messageDialog',
      });
    }
  }
}
