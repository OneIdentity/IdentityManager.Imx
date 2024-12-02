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

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { EUI_SIDESHEET_DATA, EuiSidesheetRef, EuiSidesheetService } from '@elemental-ui/core';
import { LogOp, SqlExpression, SqlWizardExpression, isExpressionInvalid } from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import _ from 'lodash';
import { Subscription } from 'rxjs/internal/Subscription';
import { BusyService } from '../../base/busy.service';
import { ConfirmationService } from '../../confirmation/confirmation.service';
import { SqlWizardApiService } from '../../sqlwizard/sqlwizard-api.service';
import { FilterTreeSelectionParameter } from './filter-tree-sidesheet/filter-tree-sidesheet.model';
import { FilterFormState, FilterTypeIdentifier, FilterWizardSidesheetData } from './filter-wizard.interfaces';
import { FilterWizardService } from './filter-wizard.service';
@Component({
  selector: 'imx-filter-wizard',
  templateUrl: './filter-wizard.component.html',
  styleUrls: ['./filter-wizard.component.scss'],
})
export class FilterWizardComponent implements OnInit, OnDestroy {
  public sqlExpression: SqlWizardExpression;
  public lastGoodExpression: SqlExpression | undefined;
  public expressionDirty = false;
  public expressionInvalid = true;
  public treeFilterUpdated = false;
  public selectedTabIndex = 0;
  public formState: FilterFormState = { canClearFilters: false, dirty: false, filterIdentifier: FilterTypeIdentifier.Predefined };
  public readonly FilterTypeIdentifier: FilterTypeIdentifier;
  public readonly FTIPredefined = FilterTypeIdentifier.Predefined;
  public readonly FTICustom = FilterTypeIdentifier.Custom;
  public readonly FTITargetSystem = FilterTypeIdentifier.TargetSystem;

  private busyService = new BusyService();

  private readonly subscriptions: Subscription[] = [];
  private confirmLeaveTitle = '';
  private confirmLeaveMessage = '';
  private hasProperties: boolean = false;
  public initialized = false;
  public isLoading = false;
  public hasTreeFilter = false;
  private treeFilterArgs: FilterTreeSelectionParameter | undefined;

  private readonly emptyExpression = {
    Expression: {
      Expressions: [
        {
          Expressions: [],
          LogOperator: LogOp.AND,
          Negate: false,
        },
      ],
      LogOperator: LogOp.AND,
      Negate: false,
    },
  };

  constructor(
    private readonly sidesheetService: EuiSidesheetService,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly confirm: ConfirmationService,
    private readonly filterService: FilterWizardService,
    public readonly sqlWizardSvc: SqlWizardApiService,
    readonly translation: TranslateService,
    @Inject(EUI_SIDESHEET_DATA) public data?: FilterWizardSidesheetData,
  ) {
    translation.get('#LDS#Heading Cancel Filtering').subscribe((value: string) => (this.confirmLeaveTitle = value));
    translation
      .get('#LDS#The specified filter will not be applied. Are you sure you want to cancel filtering?')
      .subscribe((value: string) => (this.confirmLeaveMessage = value));

    data?.filterExpression ? (this.sqlExpression = data.filterExpression) : (this.sqlExpression = _.cloneDeep(this.emptyExpression));

    this.filterService.filterTabChanged(FilterTypeIdentifier.Predefined);

    this.lastGoodExpression = _.cloneDeep(this.sqlExpression?.Expression);
    this.sidesheetRef.closeClicked().subscribe(() => this.close());
    this.expressionInvalid = (data?.filterExpression && isExpressionInvalid(this.sqlExpression)) == true;

    this.treeFilterArgs = data?.filterTreeParameter?.preSelection;

    this.subscriptions.push(
      this.filterService.filterFormStateEvent.subscribe((formState: FilterFormState) => {
        setTimeout(() => (this.formState = formState));
      }),
    );

    this.subscriptions.push(this.busyService.busyStateChanged.subscribe((state) => (this.isLoading = state)));
  }

  public async ngOnInit(): Promise<void> {
    const busy = this.busyService.beginBusy();
    try {
      const columns = await this.sqlWizardSvc.getFilterProperties(this.data?.settings?.entitySchema?.TypeName ?? '');
      this.hasProperties = columns?.length > 0;
      this.initialized = true;

      this.hasTreeFilter =
        this.data?.filterTreeParameter?.filterTreeParameter != null &&
        !!(await this.data.filterTreeParameter.filterTreeParameter.filterMethode(''))?.Elements?.length;
    } finally {
      busy.endBusy();
    }
  }

  public get hasPredefinedFilters(): boolean {
    return !!this.data?.settings?.filters?.length;
  }

  public get canUseCustomFilters(): boolean {
    return !this.data?.isDataSourceLocal && this.hasProperties && this.showSqlWizard;
  }

  /**
   * Counts if we have at least 2 tabs to show
   */
  public get useTabs(): boolean {
    return [this.hasPredefinedFilters, this.canUseCustomFilters, this.hasTreeFilter].reduce((a, b) => a + (b ? 1 : 0), 0) > 1;
  }

  public ngOnDestroy(): void {
    if (isExpressionInvalid(this.sqlExpression) && this.sqlExpression.Expression) {
      this.sqlExpression.Expression.Expressions = [];
    }

    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public checkChanges(): void {
    this.expressionDirty = !_.isEqual(this.sqlExpression?.Expression, this.lastGoodExpression);
    this.expressionInvalid =
      !_.isEqual(this.sqlExpression?.Expression, this.emptyExpression?.Expression) && isExpressionInvalid(this.sqlExpression);
  }

  public onApplyFilters(): void {
    this.filterService.applyFilters();
    this.sidesheetService.close({ expression: this.sqlExpression, treeFilter: this.treeFilterArgs });
  }

  public onClearFilters(): void {
    this.lastGoodExpression = undefined;
    if (this.sqlExpression.Expression) {
      this.sqlExpression.Expression.Expressions = [];
    }
    this.filterService.clearFilters();
    this.sidesheetService.close({ expression: this.sqlExpression, treeFilter: undefined });
  }

  public onSelectedTabChange(event: MatTabChangeEvent): void {
    this.filterService.filterTabChanged(event.tab.content?.templateRef.elementRef.nativeElement.parentElement.id as FilterTypeIdentifier);
  }

  public onFilterTreeSelectionChanged(event: FilterTreeSelectionParameter) {
    this.treeFilterUpdated = true;
    this.treeFilterArgs = event;
  }

  public canApplyCustomFilters(): boolean {
    return (this.expressionDirty || this.formState?.dirty || this.treeFilterUpdated) && !this.expressionInvalid;
  }

  public canRemoveCustomFilter(): boolean {
    return !!this.lastGoodExpression?.Expressions?.length || this.formState?.canClearFilters;
  }

  public containsTargetSystemFilter(): boolean {
    let filters = this.data?.settings.filters;
    return (filters && filters.find((item) => item.Name === 'namespace') != null) ?? false;
  }

  public get showSqlWizard(): boolean {
    return this.sqlWizardSvc.implemented ?? false;
  }

  private async close(): Promise<void> {
    if (!this.expressionDirty && !this.formState?.dirty) {
      this.sidesheetRef.close();
      return;
    }

    if (await this.confirm.confirmLeaveWithUnsavedChanges(this.confirmLeaveTitle, this.confirmLeaveMessage)) {
      this.sqlExpression.Expression = this.lastGoodExpression;
      this.sidesheetRef.close();
    }
  }
}
