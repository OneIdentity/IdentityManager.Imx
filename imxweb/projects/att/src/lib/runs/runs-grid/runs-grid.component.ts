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
import { Component, Input, OnInit } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { CollectionLoadParameters, CompareOperator, DataModel, FilterData, FilterType, ValType } from 'imx-qbm-dbts';
import { PortalAttestationRun, RunStatisticsConfig } from 'imx-api-att';
import { DataSourceToolbarFilter, DataSourceToolbarGroupData, DataSourceToolbarSettings, DataTableGroupedData, SettingsService } from 'qbm';
import { ApiService } from '../../api.service';
import { createGroupData } from '../../datamodel/datamodel-helper';
import { RunSidesheetComponent } from '../run-sidesheet.component';
import { RunsService } from '../runs.service';
import { PermissionsService } from '../../admin/permissions.service';

@Component({
  selector: 'imx-runs-grid',
  templateUrl: './runs-grid.component.html',
  styleUrls: ['./runs-grid.component.scss']
})
export class RunsGridComponent implements OnInit {

  /**
   * Settings needed by the DataSourceToolbarComponent
   */
  public dstSettings: DataSourceToolbarSettings;
  public readonly categoryBadgeColor = {
    Bad: 'red',
    Mediocre: 'orange',
    Good: 'white'
  };

  @Input() public uidAttestationPolicy;

  public groupedData: { [key: string]: DataTableGroupedData } = {};
  public attestationRunConfig: RunStatisticsConfig;

  public canSeeAttestationPolicies: boolean;
  public hasPendingAttestations: boolean;
  public progressCalcThreshold: number;

  private runs: PortalAttestationRun[];

  private filterOptions: DataSourceToolbarFilter[] = [];
  private groupData: DataSourceToolbarGroupData;
  /**
   * Page size, start index, search and filtering options etc.
   */
  private navigationState: CollectionLoadParameters;
  private readonly orderBy = { OrderBy: 'PolicyProcessed desc' };

  private filter: { filter: FilterData[] };
  private dataModel: DataModel;

  constructor(
    private runsService: RunsService,
    private busyService: EuiLoadingService,
    private sideSheet: EuiSidesheetService,
    private readonly attService: ApiService,
    private readonly settingsService: SettingsService,
    private readonly permissions: PermissionsService,
    private translate: TranslateService
  ) { }

  public async ngOnInit(): Promise<void> {
    this.filter = {
      filter: this.uidAttestationPolicy == null ? [] : [{
        CompareOp: CompareOperator.Equal,
        Type: FilterType.Compare,
        ColumnName: 'UID_AttestationPolicy',
        Value1: this.uidAttestationPolicy
      }]
    };
    this.navigationState = { ...{ PageSize: this.settingsService.DefaultPageSize, StartIndex: 0 }, ...this.orderBy, ...this.filter };
    const config = await this.attService.client.portal_attestation_config_get();
    this.attestationRunConfig = config.AttestationRunConfig;
    this.progressCalcThreshold = config.ProgressCalculationThreshold;
    this.canSeeAttestationPolicies = await this.permissions.canSeeAttestationPolicies();

    let busyIndicator: OverlayRef;
    setTimeout(() => busyIndicator = this.busyService.show());
    try {
      this.dataModel = await this.runsService.getDataModel();
      this.filterOptions = this.dataModel.Filters;
      this.groupData = createGroupData(
        this.dataModel,
        parameters => this.runsService.getGroupInfo({ ...{ PageSize: this.navigationState.PageSize, StartIndex: 0 }, ...parameters }),
        this.uidAttestationPolicy == null ? [] : ['UID_AttestationPolicy']
      );
    } finally {
      setTimeout(() => {
        this.busyService.hide(busyIndicator);
      });
    }

    await this.getData();
  }

  public async getData(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = { ...newState, ...this.orderBy, ...this.filter };
    }

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());

    const entitySchema = this.attService.typedClient.PortalAttestationRun.GetSchema();

    try {
      const data = await this.attService.typedClient.PortalAttestationRun.Get(this.navigationState);
      this.runs = data.Data;
      this.dstSettings = {
        displayedColumns: [
          entitySchema.Columns.UID_AttestationPolicy,
          entitySchema.Columns.RunCategory,
          entitySchema.Columns.PolicyProcessed,
          entitySchema.Columns.DueDate,
          entitySchema.Columns.PendingCases,
          entitySchema.Columns.ClosedCases,
          entitySchema.Columns.Progress,
          {
            ColumnName: 'details',
            Type: ValType.String,
            afterAdditionals: true
          }
        ],
        dataSource: data,
        entitySchema,
        navigationState: this.navigationState,
        filters: this.filterOptions,
        dataModel: this.dataModel,
        groupData: this.groupData,
        identifierForSessionStore: 'runs-grid'
      };

      this.hasPendingAttestations = this.runs?.some(run => run.PendingCases.value > 0);
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public async onSearch(keywords: string): Promise<void> {
    return this.getData({
      PageSize: this.navigationState.PageSize,
      StartIndex: 0,
      search: keywords
    });
  }

  public async onRunChanged(run: PortalAttestationRun): Promise<void> {
    await this.sideSheet.open(RunSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading View Attestation Run Details').toPromise(),
      headerColour: 'iris-blue',
      bodyColour: 'asher-gray',
      padding: '0px',
      width: 'max(768px, 60%)',
      data: {
        run: await this.runsService.getSingleRun(run.GetEntity().GetKeys()[0]),
        attestationRunConfig: this.attestationRunConfig,
        canSeeAttestationPolicies: this.canSeeAttestationPolicies,
        threshold: this.progressCalcThreshold,
        completed: this.isCompleted(run)
      }
    }).afterClosed().toPromise();
    await this.getData();
  }

  public async onGroupingChange(groupKey: string): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));

    try {
      const groupedData = this.groupedData[groupKey];
      groupedData.data = await this.attService.typedClient.PortalAttestationRun.Get(groupedData.navigationState);
      groupedData.settings = {
        displayedColumns: this.dstSettings.displayedColumns,
        dataSource: groupedData.data,
        entitySchema: this.dstSettings.entitySchema,
        navigationState: groupedData.navigationState
      };
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public async sendReminderEmail(): Promise<void> {
    return this.runsService.sendReminderEmail(this.runs);
  }

  public isCompleted(run: PortalAttestationRun): boolean {
    return (run.ClosedCases.value + run.PendingCases.value) > 0 && run.PendingCases.value === 0;
  }
}
