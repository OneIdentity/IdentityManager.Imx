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

import { Component, ViewChild, TemplateRef, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { imx_SessionService } from 'qbm';
import { RequestHistoryLoadParameters } from './request-history-load-parameters.interface';

@Component({
    templateUrl: './requestfilter.component.html',
    selector: 'imx-request-filter',
    styleUrls: ['./requestfilter.component.scss']
})
export class RequestFilterComponent implements OnInit {

    @ViewChild('Call1') public tplCall1: TemplateRef<any>;

    @Input() public filter: RequestHistoryLoadParameters;

    public headLine: string;

    /* TODO
    Column({"DataType":"System.String","Name":"UID_PersonApproved","ForeignKey",
       "DataSource":"ReadWriteData","DBColumnName":"\"UID_Person\"","DBTableName":"\"Person\"",
       "FKWhereClause":"sqlor(sqlcompareuid(\"uid_person\", getuseraudit()),
              sqland( format(\"uid_person in ( select uid_person from person where {0} )\",
               variable( IsNullOrEmpty( getconfig(\"VI_Employee_Person_Filter\"), \"1=1\")))))"});
    */



    /* TODO
    DataEventHandler({"DataTable":"Vars","ScriptItemUID":"DataEventHandler1","Operation":"Update"}, () => {
    this.Search();
    DataEventHandlerColumn({"DataColumn":"UID_PersonAudit"});
    });
    */

    @Input() public setuseraudit: string;

    public uidPersonAudit: string;

    @Input() public showaudit: boolean;

    @Input() public form = 'Requester';

    constructor(private session: imx_SessionService, private translator: TranslateService, private dialogService: MatDialog) { }

    public Button3(): void {
        this.dialogService.open(this.tplCall1);
    }

    public isManagerOfOthers(): boolean {
        return true; // TODO exists("person", getconfig("VI_Employee_Person_Filter"))
    }

    public async ngOnInit(): Promise<void> {
        this.SetInitial();

        if (this.showaudit && !this.getuseraudit()) {
            if (this.showfor('Requester')) {
                this.headLine = await this.translator.get('#LDS#The page displays all requests.').toPromise();
            } else if (this.showfor('Approver')) {
                this.headLine = await this.translator.get('#LDS#The page displays all requests.').toPromise();
            }
        } else if (this.setuseraudit) {
            if (this.showfor('Requester')) {
                this.headLine = await this.translator.get('#LDS#This page displays all requests of the selected identity.').toPromise();
            } else if (this.showfor('Approver')) {
                this.headLine = await this.translator.get('#LDS#The page displays all approvals of the selected identity where the selected identity was involved in the approval process.').toPromise();
            }
        } else if (!this.showaudit && !this.setuseraudit) {
            if (this.showfor('Approver')) {
                this.headLine = await this.translator.get('#LDS#This page shows the history of your approval decisions.').toPromise();
            } else {
                this.headLine = await this.translator.get('#LDS#This page shows the history of your requested products.').toPromise();
            }
        }
    }

    public SetInitial(): void {
        if (this.setuseraudit) {
            this.uidPersonAudit = this.setuseraudit;
        }
        this.filter = { };
    }

    public Search(): void {

        // TODO integrate
    }

    public auditmode(): boolean {
        return !!this.uidPersonAudit;
    }

    public getuseraudit(): string {
        if (!this.uidPersonAudit && !this.showaudit) {
            return this.session.SessionState.UserUid;
        } else {
            return this.uidPersonAudit;
        }
    }

    public showfor(type: string): boolean {
        return this.form === type;
    }

    public Button1(): void {
        this.SetInitial();
        this.Search();
    }

    public Button2(): void {
        this.Search();
    }

}
