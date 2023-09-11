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

import { Component, ErrorHandler, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EuiLoadingService } from '@elemental-ui/core';

import { ReadWriteExtTypedEntity, TranslationDataRead, TranslationDataWrite, TranslationDataWriteElement } from 'imx-qbm-dbts';
import { SnackBarService } from '../snackbar/snack-bar.service';

@Component({
  selector: 'imx-translation-editor',
  templateUrl: './translation-editor.component.html',
  styleUrls: ['./translation-editor.component.scss']
})
export class TranslationEditorComponent implements OnInit {

  public translationData: TranslationDataRead;
  public translationDataWrite: TranslationDataWrite={};

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ReadWriteExtTypedEntity<{ Translations?: TranslationDataRead}, TranslationDataWrite>,
    private readonly snackbar: SnackBarService,
    private readonly busyService: EuiLoadingService,
    private readonly errorHandler: ErrorHandler,
    public dialogRef: MatDialogRef<TranslationEditorComponent>,
    ) {
    }

  public ngOnInit(): void {
    if (this.data && this.data.extendedDataRead) {
      this.translationData = this.data.extendedDataRead.Translations;
      this.translationDataWrite.Translations = [];
    }

    if (this.translationData.Translations[0]) {
      Object.keys(this.translationData.Translations[0]).forEach(
        key => {
          this.translationData.Translations[0][key].forEach(
            data=>{ 
              let translationDataWriteElement:TranslationDataWriteElement = {};
              translationDataWriteElement.ColumnName = key;
              translationDataWriteElement.TranslationKey = this.data.GetEntity().GetColumn(key).GetValue();
              translationDataWriteElement.TranslationValue = data.Translation;
              translationDataWriteElement.UidCulture = data.LanguageId;
              this.translationDataWrite.Translations.push(translationDataWriteElement);
            }
          );      
        }
      );
    }
  }

  public getDisplay(column:string) : string{
    return this.data.GetEntity().GetColumn(column).GetMetadata().GetDisplay();
  }

  public getValue(columnName: string, uidCulture) : string {
    let value = "";
    if (this.translationData.Translations[0]) {
      let matchedData = this.translationData.Translations[0][columnName];
      if (matchedData) {
        value = matchedData.find(x => x.LanguageId == uidCulture) 
        ? matchedData.find(x=>x.LanguageId == uidCulture).Translation 
        : "";
      }
    }
    return value;
  }

  public onInput(translationValue: string, columnName: string, uidCulture: string): void {
    if (this.translationDataWrite && this.translationDataWrite.Translations 
      && this.translationDataWrite.Translations.find(x => x.ColumnName === columnName && x.UidCulture === uidCulture)) {
      let matchedElement = this.translationDataWrite.Translations.find(x => x.ColumnName === columnName && x.UidCulture === uidCulture);
      matchedElement.TranslationValue = translationValue;
    }
    else {
      let translationDataWriteElement: TranslationDataWriteElement = {};
      translationDataWriteElement.ColumnName = columnName;
      translationDataWriteElement.TranslationKey = this.data.GetEntity().GetColumn(columnName).GetValue();
      translationDataWriteElement.TranslationValue = translationValue;
      translationDataWriteElement.UidCulture = uidCulture;
      this.translationDataWrite.Translations.push(translationDataWriteElement);
    }
  }

  public async save():Promise<void>{
    const overlayRef = this.busyService.show();
    try {
      await this.data.setExtendedData({
        Translations: this.translationDataWrite.Translations
      });

      await this.data.GetEntity().Commit();
      this.snackbar.open({ key: '#LDS#The translations have been successfully saved.' }, '#LDS#Close', { duration: 3000 });
    } catch (error) {
      this.errorHandler.handleError(error);
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
      this.dialogRef.close();
    }
  }

}
