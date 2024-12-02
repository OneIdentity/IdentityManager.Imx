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

import { Component, ErrorHandler, Input, OnInit } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { PortalPasswordquestions } from '@imx-modules/imx-api-qer';
import {
  CollectionLoadParameters,
  DisplayColumns,
  EntitySchema,
  ExtendedTypedEntityCollection,
  IClientProperty,
  TypedEntityCollectionData,
} from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import {
  BusyService,
  calculateSidesheetWidth,
  ConfirmationService,
  DataViewInitParameters,
  DataViewSource,
  LdsReplacePipe,
  SnackBarService,
} from 'qbm';
import { PasswordQuestionInterface, PasswordQuestionService, PasswordQuestionType } from './password-question.service';
import { PasswordQuestionsSidesheetComponent } from './password-questions-sidesheet/password-questions-sidesheet.component';

@Component({
  selector: 'imx-password-questions',
  templateUrl: './password-questions.component.html',
  styleUrls: ['./password-questions.component.scss'],
  providers: [DataViewSource],
})
export class PasswordQuestionsComponent implements OnInit {
  @Input() public passwordQuestionType: PasswordQuestionType = 'passwordreset';
  public items: ExtendedTypedEntityCollection<PortalPasswordquestions, unknown>;
  public selectedQuestions: PortalPasswordquestions[] = [];
  public DisplayColumns = DisplayColumns;
  public requiredPasswordQuestions: number;
  public entitySchema: EntitySchema;
  public busyService = new BusyService();
  public displayedColumns: IClientProperty[];

  constructor(
    private readonly passwordQuestionService: PasswordQuestionService,
    private readonly errorHandler: ErrorHandler,
    private readonly sidesheetService: EuiSidesheetService,
    private readonly snackbar: SnackBarService,
    private readonly confirmation: ConfirmationService,
    private readonly translate: TranslateService,
    private readonly ldsReplace: LdsReplacePipe,
    private readonly busy: EuiLoadingService,
    public dataSource: DataViewSource<PasswordQuestionInterface>,
  ) {}

  public async ngOnInit(): Promise<void> {
    const entitySchema = this.passwordQuestionService.getSchema();
    this.entitySchema = entitySchema;
    const isBusy = this.busyService.beginBusy();
    try {
      this.passwordQuestionService.setPasswordQuestionType(this.passwordQuestionType);
      this.requiredPasswordQuestions = await this.passwordQuestionService.getRequiredPasswordQuestion();
      this.displayedColumns = [entitySchema.Columns.PasswordQuery, entitySchema.Columns.IsLocked];
    } finally {
      isBusy.endBusy();
    }

    this.getData();
  }

  public async openEditSidesheet(question: PortalPasswordquestions): Promise<void> {
    const deleteMessage = await this.getDeleteMessage(1);
    const sidesheetRef = this.sidesheetService.open(PasswordQuestionsSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading Edit Password Question').toPromise(),
      subTitle: question.GetEntity().GetDisplay(),
      disableClose: true,
      panelClass: 'imx-sidesheet',
      icon: 'password',
      padding: '0',
      width: calculateSidesheetWidth(1100, 0.7),
      testId: 'edit-question-sidesheet',
      data: {
        passwordQuestion: question,
        isNew: false,
        deleteMessage,
      },
    });

    if (await sidesheetRef.afterClosed().toPromise()) {
      return this.dataSource.updateState();
    }
  }

  public getData(): void {
    const dataViewInitParameters: DataViewInitParameters<PortalPasswordquestions> = {
      execute: (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<PortalPasswordquestions>> =>
        this.passwordQuestionService.get(params),
      schema: this.entitySchema,
      columnsToDisplay: this.displayedColumns,
      highlightEntity: (entity: PortalPasswordquestions) => {
        this.openEditSidesheet(entity);
      },
      selectionChange: (selection: PortalPasswordquestions[]) => {
        this.selectedQuestions = selection;
      },
    };
    this.dataSource.init(dataViewInitParameters);
  }

  public async create(): Promise<void> {
    const newItem = this.passwordQuestionService.create();
    const sidesheetRef = this.sidesheetService.open(PasswordQuestionsSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading Create Password Question').toPromise(),
      disableClose: true,
      panelClass: 'imx-sidesheet',
      icon: 'password',
      padding: '0',
      width: calculateSidesheetWidth(1100, 0.7),
      testId: 'create-question-sidesheet',
      data: {
        passwordQuestion: newItem,
        isNew: true,
      },
    });

    if (await sidesheetRef.afterClosed().toPromise()) {
      return this.dataSource.updateState();
    }
  }

  public async delete(): Promise<void> {
    const message = await this.getDeleteMessage(this.selectedQuestions.length);

    if (
      await this.confirmation.confirm({
        Title: this.selectedQuestions.length > 1 ? this.ldsDeleteTitleMutiple : this.ldsDeleteTitleSingle,
        Message: message,
      })
    ) {
      let deleteCount = 0;
      this.busy.show();

      try {
        for (const question of this.selectedQuestions) {
          if (await this.tryDelete(question)) {
            deleteCount++;
          }
        }
      } finally {
        this.busy.hide();
        if (deleteCount > 0) {
          this.snackbar.open({ key: deleteCount > 1 ? this.ldsDeleteSnackbarMessageMultiple : this.ldsDeleteSnackbarMessageSingle });
          return this.dataSource.updateState();
        }
      }
    }
  }

  public selectedItemsCanBeDeleted(): boolean {
    return this.selectedQuestions != null && this.selectedQuestions.length > 0;
  }

  public get showComponentHeading(): boolean {
    return this.passwordQuestionType === 'passwordreset';
  }

  private async tryDelete(item: PortalPasswordquestions): Promise<boolean> {
    try {
      await this.passwordQuestionService.delete(item);
      return true;
    } catch (error) {
      this.errorHandler.handleError(error);
    }
    return false;
  }

  private async getDeleteMessage(itemsToDelete: number): Promise<string> {
    const numberOfQuestionsAfterDeletion = this.dataSource.collectionData().totalCount - itemsToDelete;
    return numberOfQuestionsAfterDeletion < this.requiredPasswordQuestions
      ? this.ldsReplace.transform(
          await this.translate
            .get(itemsToDelete > 1 ? this.ldsDeleteMessageWarningMultiple : this.ldsDeleteMessageWarningSingle)
            .toPromise(),
          this.requiredPasswordQuestions,
        )
      : await this.translate.get(itemsToDelete > 1 ? this.ldsDeleteMessageMultiple : this.ldsDeleteMessageSingle).toPromise();
  }

  private ldsDeleteTitleSingle = '#LDS#Heading Delete Password Question';
  private ldsDeleteTitleMutiple = '#LDS#Heading Delete Password Questions';
  private ldsDeleteMessageSingle = '#LDS#Are you sure you want to delete this password question?';
  private ldsDeleteMessageMultiple = '#LDS#Are you sure you want to delete the selected password questions?';
  private ldsDeleteMessageWarningSingle =
    '#LDS#If you delete this password question, you no longer have enough password questions and must create a new password question. You need at least {0} active password questions. Are you sure you want to delete this password question?';
  private ldsDeleteMessageWarningMultiple =
    '#LDS#If you delete these password questions, you no longer have enough password questions and must create a new password question. You need at least {0} active password questions. Are you sure you want to delete these password questions?';
  private ldsDeleteSnackbarMessageSingle = '#LDS#The password question has been successfully deleted.';
  private ldsDeleteSnackbarMessageMultiple = '#LDS#The password questions have been successfully deleted.';
}
