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
 * Copyright 2022 One Identity LLC.
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

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { CollectionLoadParameters, TypedEntity, ValType } from 'imx-qbm-dbts';

import {
  ClassloggerService,
  DataSourceToolbarFilter,
  DataSourceToolbarSettings,
  DataSourceWrapper,
  DataTableComponent,
  DataTableGroupedData,
} from 'qbm';
import { Subscription } from 'rxjs';
import { RulesViolationsApproval } from './rules-violations-approval';
import { RulesViolationsActionService } from './rules-violations-action/rules-violations-action.service';
import { RulesViolationsDetailsComponent } from './rules-violations-details/rules-violations-details.component';
import { RulesViolationsService } from './rules-violations.service';
import { ActivatedRoute, Params } from '@angular/router';
import { DataModelWrapper } from 'qbm/lib/data-source-toolbar/data-model/data-model-wrapper.interface';
import { OverlayRef } from '@angular/cdk/overlay';

/**
 * Component that shows all rules violations that the user can approve or deny.
 * Therefore, the user can also view some information about the rules violations.
 *
 * Initially only the pending rules violations are shown.
 *
 */
@Component({
  selector: 'imx-rules-violations',
  templateUrl: './rules-violations.component.html',
  styleUrls: ['./rules-violations.component.scss']
})
export class RulesViolationsComponent implements OnInit, OnDestroy {

  public dataModelWrapper: DataModelWrapper;
  public dstWrapper: DataSourceWrapper<RulesViolationsApproval>;
  public dstSettings: DataSourceToolbarSettings;
  public selectedRulesViolations: RulesViolationsApproval[] = [];
  public groupedData: { [key: string]: DataTableGroupedData } = {};

  public infoAlertText = '#LDS#Here you can get an overview of all rule violations you are responsible for. Additionally, you can grant or deny exceptions for these rule violations.';

  @ViewChild(DataTableComponent) public table: DataTableComponent<TypedEntity>;

  private readonly subscriptions: Subscription[] = [];

  constructor(
    public readonly rulesViolationsService: RulesViolationsService,
    public readonly actionService: RulesViolationsActionService,
    private readonly busyService: EuiLoadingService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly logger: ClassloggerService,
    private readonly activatedRoute: ActivatedRoute
  ) {
    this.subscriptions.push(this.actionService.applied.subscribe(async () => {
      this.getData();
      this.table.clearSelection();
    }));
  }

  public async ngOnInit(): Promise<void> {
    const entitySchema = this.rulesViolationsService.rulesViolationsApproveSchema;

    this.dataModelWrapper = {
      dataModel: await this.rulesViolationsService.getDataModel(),
      getGroupInfo: parameters => this.rulesViolationsService.getGroupInfo(parameters),
      groupingFilterOptions: ['state']
    };

    this.dstWrapper = new DataSourceWrapper(
      state => this.rulesViolationsService.getRulesViolationsApprove(state),
      [
        entitySchema.Columns.UID_Person,
        entitySchema.Columns.UID_NonCompliance,
        entitySchema.Columns.State,
        {
          ColumnName: 'decision',
          Type: ValType.String,
          afterAdditionals: true
        },
        {
          ColumnName: 'actions',
          Type: ValType.String
        }
      ],
      entitySchema,
      this.dataModelWrapper
    );

    this.subscriptions.push(this.activatedRoute.queryParams.subscribe(params => this.updateFiltersFromRouteParams(params)));

    await this.getData();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public async getData(parameter?: CollectionLoadParameters): Promise<void> {
    this.rulesViolationsService.handleOpenLoader();
    try {
      this.dstSettings = await this.dstWrapper.getDstSettings(parameter);
    } finally {
      this.rulesViolationsService.handleCloseLoader();
    }
  }

  public onSelectionChanged(items: RulesViolationsApproval[]): void {
    this.logger.trace(this, 'selection changed', items);
    this.selectedRulesViolations = items;
  }

  /**
   * Opens the {@link RulesViolationsDetailsComponent} sidesheet thats shows some informations of the selected rules violation.
   * @param selectedRulesViolation the selected {@link RulesViolationsApproval}
   */
  public async viewDetails(selectedRulesViolation: RulesViolationsApproval): Promise<void> {
    const result = await this.sidesheet.open(RulesViolationsDetailsComponent, {
      title: await this.translate.get('#LDS#Heading View Rule Violation Details').toPromise(),
      headerColour: 'iris-blue',
      bodyColour: 'asher-gray',
      panelClass: 'imx-sidesheet',
      padding: '0',
      width: '600px',
      testId: 'rules-violations-details-sidesheet',
      data: selectedRulesViolation,
    }).afterClosed().toPromise();

    if (result) {
      this.getData();
    }
  }

  public async onGroupingChange(groupKey: string): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));

    try {
      const groupedData = this.groupedData[groupKey];
      groupedData.data = await this.rulesViolationsService.getRulesViolationsApprove(groupedData.navigationState);
      groupedData.settings = {
         displayedColumns: this.dstSettings.displayedColumns,
         dataSource: groupedData.data,
         entitySchema: this.dstSettings.entitySchema,
         navigationState: groupedData.navigationState,
      };
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  private updateFiltersFromRouteParams(params: Params): void {
    let foundMatchingParam = false;
    for (const [key, value] of Object.entries(params)) {
      if (this.tryApplyFilter(key, value)) {
        foundMatchingParam = true;
      }
    }

    if (! foundMatchingParam) {
      this.applyDefaultFiltering();
    }
  }

  private applyDefaultFiltering(): void{
    this.tryApplyFilter('state', 'pending');
  }

  private tryApplyFilter(name: string, value: string): boolean {
    const index = this.dataModelWrapper.dataModel.Filters.findIndex(elem => elem.Name.toLowerCase() === name.toLowerCase());

    if (index > -1) {
      const filter = this.dataModelWrapper.dataModel.Filters[index] as DataSourceToolbarFilter;
      if (filter) {
        filter.InitialValue = value;
        filter.CurrentValue = value;
        return true;
      }
    }

    return false;
  }

}
