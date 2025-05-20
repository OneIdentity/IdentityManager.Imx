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

import { Component, Input, OnInit } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { PortalAttestationRun, RunStatisticsConfig, V2ApiClientMethodFactory } from '@imx-modules/imx-api-att';
import {
  CollectionLoadParameters,
  CompareOperator,
  DataModel,
  EntityCollectionData,
  EntitySchema,
  FilterType,
  MethodDefinition,
  MethodDescriptor,
  TypedEntityCollectionData,
} from '@imx-modules/imx-qbm-dbts';
import {
  calculateSidesheetWidth,
  DataSourceToolbarExportMethod,
  DataSourceToolbarFilter,
  DataSourceToolbarViewConfig,
  DataViewInitParameters,
  DataViewSource,
  SettingsService,
} from 'qbm';

import { ViewConfigData } from '@imx-modules/imx-api-qer';
import { ViewConfigService } from 'qer';
import { PermissionsService } from '../../admin/permissions.service';
import { ApiService } from '../../api.service';
import { AttestationFeatureGuardService } from '../../attestation-feature-guard.service';
import { RunSidesheetComponent } from '../run-sidesheet.component';
import { RunsService } from '../runs.service';

@Component({
  selector: 'imx-runs-grid',
  templateUrl: './runs-grid.component.html',
  styleUrls: ['./runs-grid.component.scss'],
  providers: [DataViewSource],
})
export class RunsGridComponent implements OnInit {
  public readonly categoryBadgeColor = {
    Bad: 'warn',
    Mediocre: 'accent',
    Good: 'primary',
  };

  public entitySchema: EntitySchema;
  @Input() public uidAttestationPolicy;

  public attestationRunConfig: RunStatisticsConfig | undefined;

  public canSeeAttestationPolicies: boolean;
  public hasPendingAttestations: boolean;
  public progressCalcThreshold: number;

  private runs: PortalAttestationRun[];

  private filterOptions: DataSourceToolbarFilter[] | undefined = [];
  private dataModel: DataModel;
  private viewConfig: DataSourceToolbarViewConfig;
  private viewConfigPath = 'attestation/run';

  constructor(
    private runsService: RunsService,
    private readonly attFeatureService: AttestationFeatureGuardService,
    private viewConfigService: ViewConfigService,
    private busyService: EuiLoadingService,
    private sideSheet: EuiSidesheetService,
    private readonly attService: ApiService,
    private readonly settingsService: SettingsService,
    private readonly permissions: PermissionsService,
    private translate: TranslateService,
    public dataSource: DataViewSource<PortalAttestationRun>,
  ) {
    this.entitySchema = this.attService.typedClient.PortalAttestationRun.GetSchema();
  }

  public async ngOnInit(): Promise<void> {
    const config = await this.attFeatureService.getAttestationConfig();
    this.attestationRunConfig = config.AttestationRunConfig;
    this.progressCalcThreshold = config.ProgressCalculationThreshold;
    this.canSeeAttestationPolicies = await this.permissions.canSeeAttestationPolicies();

    this.showBusyIndicator();
    try {
      this.dataModel = await this.runsService.getDataModel();
      this.viewConfig = await this.viewConfigService.getInitialDSTExtension(this.dataModel, this.viewConfigPath);
    } finally {
      this.busyService.hide();
    }

    await this.getData();
  }

  public async updateConfig(config: ViewConfigData): Promise<void> {
    await this.viewConfigService.putViewConfig(config);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dataSource.viewConfig.set(this.viewConfig);
  }

  public async deleteConfigById(id: string): Promise<void> {
    await this.viewConfigService.deleteViewConfig(id);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dataSource.viewConfig.set(this.viewConfig);
  }

  public async getData(): Promise<void> {
    const displayedColumns = [
      this.entitySchema.Columns.UID_AttestationPolicy,
      this.entitySchema.Columns.RunCategory,
      this.entitySchema.Columns.PolicyProcessed,
      this.entitySchema.Columns.DueDate,
      this.entitySchema.Columns.PendingCases,
      this.entitySchema.Columns.ClosedCases,
      this.entitySchema.Columns.Progress,
    ];
    const dataViewInitParameters: DataViewInitParameters<PortalAttestationRun> = {
      execute: (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<PortalAttestationRun>> =>
        this.attService.typedClient.PortalAttestationRun.Get(
          {
            ...params,
            filter: [
              ...(params.filter || []),
              ...(this.uidAttestationPolicy == null
                ? []
                : [
                    {
                      CompareOp: CompareOperator.Equal,
                      Type: FilterType.Compare,
                      ColumnName: 'UID_AttestationPolicy',
                      Value1: this.uidAttestationPolicy,
                    },
                  ]),
            ],
          },
          { signal },
        ),
      schema: this.entitySchema,
      columnsToDisplay: displayedColumns,
      dataModel: this.dataModel,
      groupExecute: (column: string, params: CollectionLoadParameters, signal: AbortSignal) => {
        return this.runsService.getGroupInfo({ ...params, by: column });
      },
      exportFunction: this.getExportMethod(),
      viewConfig: this.viewConfig,
      highlightEntity: (identity: PortalAttestationRun) => {
        this.onRunChanged(identity);
      },
    };
    this.dataSource.init(dataViewInitParameters);
  }

  public getExportMethod(): DataSourceToolbarExportMethod {
    const factory = new V2ApiClientMethodFactory();
    return {
      getMethod: (withProperties: string, navigationState: CollectionLoadParameters, PageSize?: number) => {
        let method: MethodDescriptor<EntityCollectionData>;
        if (PageSize) {
          method = factory.portal_attestation_run_get({ ...navigationState, withProperties, PageSize, StartIndex: 0 });
        } else {
          method = factory.portal_attestation_run_get({ ...navigationState, withProperties });
        }
        return new MethodDefinition(method);
      },
    };
  }

  public async onRunChanged(run: PortalAttestationRun): Promise<void> {
    await this.sideSheet
      .open(RunSidesheetComponent, {
        title: await this.translate.get('#LDS#Heading View Attestation Run Details').toPromise(),
        subTitle: run.GetEntity().GetDisplay(),
        padding: '0px',
        width: calculateSidesheetWidth(1000),
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
    await this.dataSource.updateState();
  }

  public async sendReminderEmail(): Promise<void> {
    return this.runsService.sendReminderEmail(this.runs);
  }

  public isCompleted(run: PortalAttestationRun): boolean {
    return run.ClosedCases.value + run.PendingCases.value > 0 && run.PendingCases.value === 0;
  }

  private showBusyIndicator(): void {
    if (this.busyService.overlayRefs.length === 0) {
      this.busyService.show();
    }
  }
}
