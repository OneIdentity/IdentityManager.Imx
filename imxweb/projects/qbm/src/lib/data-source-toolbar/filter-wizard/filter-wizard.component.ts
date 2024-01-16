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

import { Component, Inject, OnDestroy } from '@angular/core';
import { EuiSidesheetRef, EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { isExpressionInvalid, LogOp, SqlExpression, SqlWizardExpression } from 'imx-qbm-dbts';
import _ from 'lodash';
import { Subscription } from 'rxjs/internal/Subscription';
import { ConfirmationService } from '../../confirmation/confirmation.service';
import { FilterWizardService } from './filter-wizard.service';
import { FilterFormState, FilterTypeIdentifier, FilterWizardSidesheetData } from './filter-wizard.interfaces';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { SqlWizardApiService } from '../../sqlwizard/sqlwizard-api.service';

@Component({
  selector: 'imx-filter-wizard',
  templateUrl: './filter-wizard.component.html',
  styleUrls: ['./filter-wizard.component.scss'],
})
export class FilterWizardComponent implements OnDestroy {
  public sqlExpression: SqlWizardExpression;
  public lastGoodExpression: SqlExpression;
  public expressionDirty = false;
  public expressionInvalid = true;
  public selectedTabIndex = 0;
  public formState: FilterFormState = {canClearFilters:false, dirty: false, filterIdentifier:FilterTypeIdentifier.Predefined};
  public readonly FilterTypeIdentifier: FilterTypeIdentifier;
  public readonly FTIPredefined = FilterTypeIdentifier.Predefined;
  public readonly FTICustom = FilterTypeIdentifier.Custom;
  public readonly FTITargetSystem = FilterTypeIdentifier.TargetSystem;

  private readonly subscriptions: Subscription[] = [];
  private confirmLeaveTitle = '';
  private confirmLeaveMessage = '';
  private readonly emptyExpression = {
    Expression: {
      Expressions: [
        {
          Expressions: [],
          LogOperator: LogOp.AND,
        },
      ],
      LogOperator: LogOp.AND,
    },
  };

  constructor(
    private readonly sidesheetService: EuiSidesheetService,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly confirm: ConfirmationService,
    private readonly filterService: FilterWizardService,
    public readonly sqlWizardSvc: SqlWizardApiService,
    readonly translation: TranslateService,
    @Inject(EUI_SIDESHEET_DATA) public data?: FilterWizardSidesheetData
  ) {
    translation.get('#LDS#Heading Cancel Filtering').subscribe((value: string) => (this.confirmLeaveTitle = value));
    translation
      .get('#LDS#The specified filter will not be applied. Are you sure you want to cancel filtering?')
      .subscribe((value: string) => (this.confirmLeaveMessage = value));

    data?.filterExpression ? (this.sqlExpression = data.filterExpression) : (this.sqlExpression = _.cloneDeep(this.emptyExpression));

    this.filterService.filterTabChanged(FilterTypeIdentifier.Predefined);

    this.lastGoodExpression = _.cloneDeep(this.sqlExpression?.Expression);
    this.sidesheetRef.closeClicked().subscribe(() => this.close());
    this.expressionInvalid = data?.filterExpression && isExpressionInvalid(this.sqlExpression);

    this.subscriptions.push(
      this.filterService.filterFormStateEvent.subscribe((formState: FilterFormState) => {
        setTimeout(() => (this.formState = formState));
      })
    );
  }

  public get hasPredefinedFilters(): boolean {
    return this.data.settings?.filters?.length > 0;
  }

  public get canUseCustomFilters(): boolean {
    return !this.data.isDataSourceLocal && this.showSqlWizard;
  }

  /**
   * Counts if we have at least 2 tabs to show
   */
  public get useTabs(): boolean {
    return [this.hasPredefinedFilters, this.canUseCustomFilters].reduce((a, b) => a + (b ? 1 : 0), 0) > 1;
  }

  public ngOnDestroy(): void {
    if (isExpressionInvalid(this.sqlExpression)) {
      this.sqlExpression.Expression.Expressions = [];
    }

    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public checkChanges(): void {
    this.expressionDirty = !_.isEqual(this.sqlExpression?.Expression, this.lastGoodExpression);
    this.expressionInvalid = !_.isEqual(this.sqlExpression?.Expression, this.emptyExpression?.Expression) && isExpressionInvalid(this.sqlExpression);
  }

  public onApplyFilters(): void {
    this.filterService.applyFilters();
    this.sidesheetService.close(this.sqlExpression);
  }

  public onClearFilters(): void {
    this.lastGoodExpression = null;
    this.sqlExpression.Expression.Expressions = [];
    this.filterService.clearFilters();
    this.sidesheetService.close(this.sqlExpression);
  }

  public onSelectedTabChange(event: MatTabChangeEvent): void {
    this.filterService.filterTabChanged(event.tab.content.templateRef.elementRef.nativeElement.parentElement.id as FilterTypeIdentifier);
  }

  public canApplyCustomFilters(): boolean {
    return (this.expressionDirty || this.formState?.dirty) && !this.expressionInvalid;
  }

  public canRemoveCustomFilter(): boolean {
    return this.lastGoodExpression?.Expressions?.length > 0 || this.formState?.canClearFilters;
  }

  public containsTargetSystemFilter(): boolean {
    let filters = this.data?.settings.filters;
    return filters && filters.find((item) => item.Name === 'namespace') != null;
  }

  public get showSqlWizard(): boolean {
    return this.sqlWizardSvc.implemented;
  }

  private async close(): Promise<void> {
    if (!this.expressionDirty && !this.formState?.dirty) {
      this.sidesheetRef.close();
      return;
    }

    if (await this.confirm.confirmLeaveWithUnsavedChanges(this.confirmLeaveTitle, this.confirmLeaveMessage)) {
      if (this.expressionInvalid) {
        this.sqlExpression.Expression = this.lastGoodExpression;
      }
      this.sidesheetRef.close();
    }
  }
}
