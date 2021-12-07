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
 * Copyright 2021 One Identity LLC.
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
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ImxTranslationProviderService, MessageDialogComponent } from 'qbm';
import { ReportService } from './report.service';

@Component({
    templateUrl: "./report-detail.component.html",
    selector: 'imx-report-detail'
})
export class ReportDetailComponent {

    constructor(private translator: ImxTranslationProviderService,
        private reportSvc: ReportService,
        private dialogService: MatDialog,
        private snackBar: MatSnackBar) { }

    get subscriptions() {
        return this.reportSvc.subscriptions;
    }

    public async Mail(subscription): Promise<void> {
        // TODO post to API send mail

        this.snackBar.open(await this.translator.Translate(
            {
                key: "#LDS#The report {0} has been delivered to your e-mail address.",
                parameters: [subscription.GetEntity().GetDisplay()]
            }).toPromise());
    }

    public async DeleteSubscription(): Promise<void> {
        this.dialogService.open(MessageDialogComponent, {
            data: {
                OnYes: async () => {
                    // TODO delete current RPSSubscription     
                },
                ShowYesNo: true,
                Message: await this.translator.Translate("#LDS#Do you wish to delete this subscription?").toPromise()
            }, panelClass: 'imx-messageDialog'
        });

    }