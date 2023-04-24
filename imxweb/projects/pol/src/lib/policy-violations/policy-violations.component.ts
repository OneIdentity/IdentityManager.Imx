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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnInit, ViewChild } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';

import { CollectionLoadParameters, DataModel, DisplayColumns, TypedEntity, ValType } from 'imx-qbm-dbts';
import { DataSourceToolbarFilter, DataSourceToolbarGroupData, DataSourceToolbarSettings, DataTableComponent, DataTableGroupedData, ClientPropertyForTableColumns } from 'qbm';
import { createGroupData } from 'qbm';
import { PolicyViolation } from './policy-violation';
import { PolicyViolationsSidesheetComponent } from './policy-violations-sidesheet/policy-violations-sidesheet.component';
import { PolicyViolationsService } from './policy-violations.service';

@Component({
  selector: 'imx-policy-violations',
  templateUrl: './policy-violations.component.html',
  styleUrls: ['./policy-violations.component.scss']
})
export class PolicyViolationsComponent implements OnInit {

  public DisplayColumns = DisplayColumns;
  public selectedViolations: PolicyViolation[] = [];
  public dstSettings: DataSourceToolbarSettings;
  public approveOnly: boolean;
  public groupedData: { [key: string]: DataTableGroupedData } = {};

  @ViewChild(DataTableComponent) public table: DataTableComponent<TypedEntity>;

  private filterOptions: DataSourceToolbarFilter[] = [];
  private groupData: DataSourceToolbarGroupData;
  private dataModel: DataModel;
  private navigationState: CollectionLoadParameters;
  private displayedColumns: ClientPropertyForTableColumns[] = [];
  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly busyService: EuiLoadingService,
    public policyViolationsService: PolicyViolationsService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly actRoute: ActivatedRoute
  ) {

    this.approveOnly = actRoute.snapshot.url[actRoute.snapshot.url.length - 1].path === 'approve';

    this.navigationState = {};

    this.subscriptions.push(this.policyViolationsService.applied.subscribe(async () => {
      this.getData();
      this.table.clearSelection();
    }));
  }

  public async ngOnInit(): Promise<void> {
    const entitySchema = this.policyViolationsService.policyViolationsSchema;
    this.displayedColumns = [
      entitySchema?.Columns.UID_QERPolicy,
      entitySchema?.Columns.ObjectKey,
      entitySchema?.Columns.State,
      {
        ColumnName: 'actions',
        Type: ValType.String,
        afterAdditionals: true
      }
    ];

    let busyIndicator: OverlayRef;
    setTimeout(() => (busyIndicator = this.busyService.show()));

    try {
      this.dataModel = await this.policyViolationsService.getPolicyViolationsDataModel();
      this.filterOptions = this.dataModel.Filters;

      this.subscriptions.push(this.actRoute.queryParams.subscribe(params => this.updateFiltersFromRouteParams(params)));

      if (this.approveOnly) {
        this.tryApplyFilter('state', 'pending');
      }
      this.groupData = createGroupData(
        this.dataModel,
        (parameters) =>
          this.policyViolationsService.getGroupInfo({
            ...{
              PageSize: this.navigationState.PageSize,
              StartIndex: 0,
            },
            ...parameters,
          }),
        []
      );
    } finally {
      setTimeout(() => this.busyService.hide(busyIndicator));
    }
    return this.getData();
  }

  public async viewDetails(selectedRulesViolation: PolicyViolation): Promise<void> {
    const result = await this.sidesheet.open(PolicyViolationsSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading View Policy Violation Details').toPromise(),
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

  public onSelectionChanged(cases: PolicyViolation[]): void {
    this.selectedViolations = cases;
  }

  public async search(search: string): Promise<void> {
    return this.getData({ ...this.navigationState, ...{ search } });
  }

  public async onGroupingChange(groupKey: string): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));

    try {
      const groupedData = this.groupedData[groupKey];
      groupedData.data = await this.policyViolationsService.get(groupedData.navigationState);
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

  public async getData(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = { ...newState, ...{ OrderBy: 'XDateInserted' } };
    }

    let busyIndicator: OverlayRef;
    setTimeout(() => (busyIndicator = this.busyService.show()));

    try {
      const dataSource = await this.policyViolationsService.get(this.navigationState);
      const entitySchema = this.policyViolationsService.policyViolationsSchema;
      this.dstSettings = {
        dataSource,
        entitySchema,
        navigationState: this.navigationState,
        filters: this.filterOptions,
        dataModel: this.dataModel,
        groupData: this.groupData,
        displayedColumns: this.displayedColumns,
      };
    } finally {
      setTimeout(() => this.busyService.hide(busyIndicator));
    }
  }

  private updateFiltersFromRouteParams(params: Params): void {
    let foundMatchingParam = false;
    for (const [key, value] of Object.entries(params)) {
      if (this.tryApplyFilter(key, value)) {
        foundMatchingParam = true;
      }
    }
  }

  private tryApplyFilter(name: string, value: string): boolean {
    const index = this.dataModel.Filters.findIndex(elem => elem.Name.toLowerCase() === name.toLowerCase());

    if (index > -1) {
      const filter = this.dataModel.Filters[index] as DataSourceToolbarFilter;
      if (filter) {
        filter.InitialValue = value;
        filter.CurrentValue = value;
        this.navigationState[name] = value;
        return true;
      }
    }

    return false;
  }
}
