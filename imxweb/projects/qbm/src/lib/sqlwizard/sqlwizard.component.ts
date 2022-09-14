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

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { SqlViewSettings } from './SqlNodeView';
import { LogOp as _logOp, SqlExpression } from 'imx-qbm-dbts';
import { SqlWizardApiService } from './sqlwizard-api.service';

@Component({
    templateUrl: './sqlwizard.component.html',
    styleUrls: ['./sqlwizard.scss'],
    selector: 'imx-sqlwizard'
})
export class SqlWizardComponent implements OnInit, OnChanges {

    public LogOp = _logOp;

    public viewSettings: SqlViewSettings;

    @Input() public tableName: string;
    @Input() public expression: SqlExpression;
    /** Alternate API service to use. */
    @Input() public apiService: SqlWizardApiService;

    @Output() public change = new EventEmitter<any>();

    constructor(private readonly apiSvc: SqlWizardApiService) {
    }

    public async ngOnInit(): Promise<void> {
        await this.reinit();
    }

    public async addExpression(): Promise<void> {
      await this.viewSettings.root.addChildNode();
      this.emitChanges();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if ((changes['expression'] && changes['expression'].currentValue !== this.expression) ||
            (changes['tableName'] && changes['tableName'].currentValue !== this.viewSettings?.root.tableName)) {
              this.reinit();
        }
    }

    public emitChanges(): void {
      this.change.emit();
    }

    private async reinit(): Promise<void> {
        if (this.tableName && this.expression) {

            var svc = this.apiService;
            if (!svc) {
                svc = this.apiSvc;
            }
            const viewSettings = new SqlViewSettings(svc, this.tableName, this.expression);
            // first prepare, then assign to local property
            await viewSettings.root.prepare();
            this.viewSettings = viewSettings;
        }
    }
}
