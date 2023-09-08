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

import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';

import { LdsReplacePipe } from '../lds-replace/lds-replace.pipe';
import { TextContainer } from '../translation/text-container';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {
  private readonly defaultConfig: MatSnackBarConfig = {
    duration: 5000,
    verticalPosition: 'top'
  };
  private message = '';
  private action = '';
  private actionDismissCaption = '#LDS#Close';

  constructor(
    private readonly snackbar: MatSnackBar,
    private readonly translationProvider: TranslateService,
    private readonly ldsReplace: LdsReplacePipe
  ) { }

  public open(messageText: TextContainer, actionText: string = this.actionDismissCaption, config?: MatSnackBarConfig)
    : MatSnackBarRef<TextOnlySnackBar> {
    this.translationProvider.get(messageText.key)
      .pipe(map((value: string) => messageText.parameters ? this.ldsReplace.transform(value, ...messageText.parameters) : value))
      .subscribe((value: string) => this.message = value);

    this.translationProvider.get(actionText).subscribe((value: string) => this.action = value);

    return this.snackbar.open(this.message, this.action, { ...this.defaultConfig, ...config });
  }

  public openAtTheBottom(messageText: TextContainer): void {
    this.open(messageText, this.actionDismissCaption, { duration: 10000, verticalPosition: 'bottom' });
  }

  public dismiss(): void {
    this.snackbar.dismiss();
  }
}
