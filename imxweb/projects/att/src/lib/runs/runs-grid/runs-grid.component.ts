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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, Input, OnInit } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import {
  CollectionLoadParameters,
  CompareOperator,
  DataModel,
  EntityCollectionData,
  EntitySchema,
  FilterData,
  FilterType,
  MethodDefinition,
  MethodDescriptor,
} from 'imx-qbm-dbts';
import { PortalAttestationRun, RunStatisticsConfig, V2ApiClientMethodFactory } from 'imx-api-att';
import {
  DataSourceToolbarExportMethod,
  DataSourceToolbarFilter,
  DataSourceToolbarGroupData,
  DataSourceToolbarSettings,
  DataSourceToolbarViewConfig,
  DataTableGroupedData,
  SettingsService,
} from 'qbm';
import { createGroupData } from '../../datamodel/datamodel-helper';
import { RunSidesheetComponent } from '../run-sidesheet.component';
import { RunsService } from '../runs.service';
import { PermissionsService } from '../../admin/permissions.service';
import { ViewConfigData } from 'imx-api-qer';
import { ViewConfigService } from 'qer';

@Component({
  selector: 'imx-runs-grid',
  templateUrl: './runs-grid.component.html',
  styleUrls: ['./runs-grid.component.scss'],
})
export class RunsGridComponent implements OnInit {
  /**
   * Settings needed by the DataSourceToolbarComponent
   */
  public dstSettings: DataSourceToolbarSettings;
  public readonly categoryBadgeColor = {
    Bad: 'red',
    Mediocre: 'orange',
    Good: 'white',
  };

  public entitySchema: EntitySchema;
  @Input() public uidAttestationPolicy;

  public groupedData: { [key: string]: DataTableGroupedData } = {};
  public attestationRunConfig: RunStatisticsConfig | undefined;

  public canSeeAttestationPolicies: boolean;
  public hasPendingAttestations: boolean;
  public progressCalcThreshold: number;

  private runs: PortalAttestationRun[];

  private filterOptions: DataSourceToolbarFilter[] | undefined = [];
  private groupData: DataSourceToolbarGroupData;
  /**
   * Page size, start index, search and filtering options etc.
   */
  private navigationState: CollectionLoadParameters;
  private readonly orderBy = 'PolicyProcessed desc';

  private filter: { filter: FilterData[] };
  private dataModel: DataModel;
  private viewConfig: DataSourceToolbarViewConfig;
  private viewConfigPath = 'attestation/run';

  constructor(
    private runsService: RunsService,
    private viewConfigService: ViewConfigService,
    private busyService: EuiLoadingService,
    private sideSheet: EuiSidesheetService,
    private readonly settingsService: SettingsService,
    private readonly permissions: PermissionsService,
    private translate: TranslateService
  ) {
    this.entitySchema = this.runsService.AttestationRunSchema;
  }

  public async ngOnInit(): Promise<void> {
    this.filter = {
      filter:
        this.uidAttestationPolicy == null
          ? []
          : [
              {
                CompareOp: CompareOperator.Equal,
                Type: FilterType.Compare,
                ColumnName: 'UID_AttestationPolicy',
                Value1: this.uidAttestationPolicy,
              },
            ],
    };
    this.navigationState = { ...{ PageSize: this.settingsService.DefaultPageSize, StartIndex: 0 }, ...this.filter };
    const config = await this.runsService.attestationConfig();
    this.attestationRunConfig = config.AttestationRunConfig;
    this.progressCalcThreshold = config.ProgressCalculationThreshold;
    this.canSeeAttestationPolicies = await this.permissions.canSeeAttestationPolicies();

    let busyIndicator: OverlayRef;
    setTimeout(() => (busyIndicator = this.busyService.show()));
    try {
      this.dataModel = await this.runsService.getDataModel();
      this.viewConfig = await this.viewConfigService.getInitialDSTExtension(this.dataModel, this.viewConfigPath);
      // We will check the configs for default state only on init
      if (!this.viewConfigService.isDefaultConfigSet()) {
        // If we have no default settings, we have a default
        this.navigationState.OrderBy = this.orderBy;
      }
      this.filterOptions = this.dataModel.Filters;
      this.groupData = createGroupData(
        this.dataModel,
        (parameters) => this.runsService.getGroupInfo({ ...{ PageSize: this.navigationState.PageSize, StartIndex: 0 }, ...parameters }),
        this.uidAttestationPolicy == null ? [] : ['UID_AttestationPolicy']
      );
    } finally {
      setTimeout(() => {
        this.busyService.hide(busyIndicator);
      });
    }

    await this.getData(undefined, true);
  }

  public async updateConfig(config: ViewConfigData): Promise<void> {
    await this.viewConfigService.putViewConfig(config);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dstSettings.viewConfig = this.viewConfig;
  }

  public async deleteConfigById(id: string): Promise<void> {
    await this.viewConfigService.deleteViewConfig(id);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dstSettings.viewConfig = this.viewConfig;
  }

  public async getData(newState?: CollectionLoadParameters, isInitialLoad: boolean = false): Promise<void> {
    if (newState) {
      const filter = this.filter.filter.concat(newState.filter ?? []);
      this.navigationState = { ...newState, filter };
    }

    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));

    try {
      const data = isInitialLoad ? { totalCount: 0, Data: [] } : await this.runsService.getAttestationRuns(this.navigationState);
      if (data) {
        this.runs = data.Data;
        this.dstSettings = {
          displayedColumns: [
            this.entitySchema.Columns.UID_AttestationPolicy,
            this.entitySchema.Columns.RunCategory,
            this.entitySchema.Columns.PolicyProcessed,
            this.entitySchema.Columns.DueDate,
            this.entitySchema.Columns.PendingCases,
            this.entitySchema.Columns.ClosedCases,
            this.entitySchema.Columns.Progress,
          ],
          dataSource: data,
          entitySchema: this.entitySchema,
          navigationState: this.navigationState,
          filters: this.filterOptions,
          dataModel: this.dataModel,
          groupData: this.groupData,
          viewConfig: this.viewConfig,
          exportMethod: this.getExportMethod(),
        };

        this.hasPendingAttestations = this.runs?.some((run) => run.PendingCases.value > 0);
      }
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public getExportMethod(): DataSourceToolbarExportMethod {
    const factory = new V2ApiClientMethodFactory();
    return {
      getMethod: (withProperties: string, PageSize?: number) => {
        let method: MethodDescriptor<EntityCollectionData>;
        if (PageSize) {
          method = factory.portal_attestation_run_get({ ...this.navigationState, withProperties, PageSize, StartIndex: 0 });
        } else {
          method = factory.portal_attestation_run_get({ ...this.navigationState, withProperties });
        }
        return new MethodDefinition(method);
      },
    };
  }

  public async onSearch(keywords: string): Promise<void> {
    this.runsService.abortCall();
    return this.getData({
      PageSize: this.navigationState.PageSize,
      StartIndex: 0,
      search: keywords,
    });
  }

  public async onRunChanged(run: PortalAttestationRun): Promise<void> {
    await this.sideSheet
      .open(RunSidesheetComponent, {
        title: await this.translate.get('#LDS#Heading View Attestation Run Details').toPromise(),
        subTitle: run.GetEntity().GetDisplay(),
        padding: '0px',
        width: 'max(768px, 60%)',
        testId: 'runs-grid-view-attestation-run-details',
        data: {
          run: await this.runsService.getSingleRun(run.GetEntity().GetKeys()[0]),
          attestationRunConfig: this.attestationRunConfig,
          canSeeAttestationPolicies: this.canSeeAttestationPolicies,
          threshold: this.progressCalcThreshold,
          completed: this.isCompleted(run),
        },
      })
      .afterClosed()
      .toPromise();
    await this.getData();
  }

  public async onGroupingChange(groupInfo: { key: string; isInitial: boolean }): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));

    try {
      const groupedData = this.groupedData[groupInfo.key];
      groupedData.data = groupInfo.isInitial
        ? { totalCount: 0, Data: [] }
        : await this.runsService.getAttestationRuns(groupedData.navigationState);
      groupedData.settings = {
        displayedColumns: this.dstSettings.displayedColumns,
        dataModel: this.dstSettings.dataModel,
        dataSource: groupedData.data,
        entitySchema: this.dstSettings.entitySchema,
        navigationState: groupedData.navigationState,
      };
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public async sendReminderEmail(): Promise<void> {
    return this.runsService.sendReminderEmail(this.runs);
  }

  public isCompleted(run: PortalAttestationRun): boolean {
    return run.ClosedCases.value + run.PendingCases.value > 0 && run.PendingCases.value === 0;
  }
}
