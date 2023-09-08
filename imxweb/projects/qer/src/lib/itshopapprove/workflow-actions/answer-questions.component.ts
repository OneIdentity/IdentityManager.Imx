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

import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { ImxTranslationProviderService, imx_SessionService } from 'qbm';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    templateUrl: "./answer-questions.component.html"
})
export class AnswerQuestionsComponent implements OnInit {

    constructor(private translator: ImxTranslationProviderService, private dialogService: MatDialog,
        private session : imx_SessionService, private snackBar: MatSnackBar) { }

    Notice : string; // TODO caption =  translate("#LDS#Your answer")

    public ngOnInit(): void {
        // TODO load from API 
    }

    PersonWantsOrg : any[] = [];

    @ViewChild('Call1') public tplCall1: TemplateRef<any>;

    public Button3(): void {
        this.Notice = "";
        this.dialogService.open(this.tplCall1);
    }

    public async Button4(): Promise<void> {
        // TODO validate

        await this.session.Client.portal_itshop_answerquery_post(uidPwo, {
            Reason: this.Notice
        });
        // TODO update open items
        ActionOnControl({ "ActionType": "CloseDialog" });
        // TODO reload data
        this.snackBar.open(await this.translator.Translate("#LDS#Your answer has been submitted.").toPromise());
    }

    // Parameter: aeweb_uid_pwohelperpwo (FreeText) (optional)
}
