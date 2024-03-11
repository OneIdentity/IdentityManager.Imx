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

import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { SqlViewSettings } from './SqlNodeView';
import { LogOp as _logOp, SqlExpression } from 'imx-qbm-dbts';
import { SqlWizardApiService } from './sqlwizard-api.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

@Component({
  templateUrl: './sqlwizard.component.html',
  styleUrls: ['./sqlwizard.scss'],
  selector: 'imx-sqlwizard',
})
export class SqlWizardComponent implements OnInit, OnChanges, AfterViewInit {
  public readonly andConditionLabel = '#LDS#Condition_And';
  public readonly orConditionLabel = '#LDS#Condition_Or';

  public LogOp = _logOp;
  public viewSettings: SqlViewSettings;
  public get isImplemented(): boolean {
    var svc = this.apiService;
    if (!svc) {
      svc = this.apiSvc;
    }

    return svc.implemented;
  }

  @Input() public tableName: string;
  @Input() public expression: SqlExpression;
  /** Alternate API service to use. */
  @Input() public apiService: SqlWizardApiService;

  @Output() public change = new EventEmitter<any>();

  @ViewChildren('expressionItem') public expressionList: QueryList<ElementRef<HTMLLIElement>>;

  private newExpressionAdded = false;

  constructor(private readonly apiSvc: SqlWizardApiService) {}

  public async ngOnInit(): Promise<void> {
    await this.reinit();
    await this.addEmptyExpression();
  }

  public ngAfterViewInit(): void {
    setTimeout( () => {
      this.expressionList.changes.subscribe(() => {
        if (this.newExpressionAdded) {
          this.expressionList?.last?.nativeElement.scrollIntoView(true);
        }

        this.newExpressionAdded = false;
      })
    });
  }

  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (
      (changes['expression'] && changes['expression'].currentValue !== this.expression) ||
      (changes['tableName'] && changes['tableName'].currentValue !== this.viewSettings?.root.tableName)
    ) {
      this.reinit();
    }
  }

  public async addExpression(): Promise<void> {
    await this.viewSettings.root.addChildNode();
    this.newExpressionAdded = true;
    this.emitChanges();
  }

  public async removeAllExpressions(): Promise<void> {
    this.viewSettings.root.Data.Expressions?.splice(0);
    this.viewSettings.root.childViews?.splice(0);
    await this.addEmptyExpression();
    this.emitChanges();
  }

  public async emitChanges(): Promise<void> {
    this.change.emit();
    await this.addEmptyExpression();
  }

  public onOperatorChanged(event: MatButtonToggleChange): void {
    (event.value as string).toLowerCase() === 'and' ? (this.expression.LogOperator = this.LogOp.AND) : (this.expression.LogOperator = this.LogOp.OR);
    this.change.emit();
  }

  public logOpText(): string {
    return this.expression.LogOperator === this.LogOp.AND ? this.andConditionLabel : this.orConditionLabel;
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

  private async addEmptyExpression(): Promise<void> {
    if (this.viewSettings?.root?.Data?.Expressions?.length === 0) {
      await this.addExpression();
    }
  }
}
