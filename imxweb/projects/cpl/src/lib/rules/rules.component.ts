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

import { Component, OnInit } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { PortalRules } from '@imx-modules/imx-api-cpl';
import { ViewConfigData } from '@imx-modules/imx-api-qer';
import {
  CollectionLoadParameters,
  DataModel,
  DisplayColumns,
  EntitySchema,
  TypedEntityCollectionData,
  ValType,
} from '@imx-modules/imx-qbm-dbts';
import {
  BusyService,
  calculateSidesheetWidth,
  ClientPropertyForTableColumns,
  DataSourceToolbarViewConfig,
  DataViewInitParameters,
  DataViewSource,
  SystemInfoService,
} from 'qbm';
import { ViewConfigService } from 'qer';
import { CplPermissionsService } from './admin/cpl-permissions.service';
import { MitigatingControlsRulesService } from './mitigating-controls-rules/mitigating-controls-rules.service';
import { RulesMitigatingControls } from './mitigating-controls-rules/rules-mitigating-controls';
import { RulesSidesheetComponent } from './rules-sidesheet/rules-sidesheet.component';
import { RulesService } from './rules.service';

@Component({
  selector: 'imx-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss'],
  providers: [DataViewSource],
})
export class RulesComponent implements OnInit {
  public readonly DisplayColumns = DisplayColumns;
  public ruleSchema: EntitySchema;
  public isMControlPerViolation: boolean;
  public busyService = new BusyService();
  public canRecalculate = false;
  private displayedColumns: ClientPropertyForTableColumns[] = [];
  private dataModel: DataModel;
  private viewConfig: DataSourceToolbarViewConfig;
  private viewConfigPath = 'rules';

  constructor(
    private readonly rulesProvider: RulesService,
    private viewConfigService: ViewConfigService,
    private readonly mControlsProvider: MitigatingControlsRulesService,
    private readonly sideSheetService: EuiSidesheetService,
    private readonly systemInfoService: SystemInfoService,
    private readonly translate: TranslateService,
    private readonly permissionService: CplPermissionsService,
    public dataSource: DataViewSource<PortalRules>,
  ) {
    this.ruleSchema = rulesProvider.ruleSchema;
    this.displayedColumns = [
      this.ruleSchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      {
        ColumnName: 'cases',
        Type: ValType.Int,
        untranslatedDisplay: '#LDS#Rule violations',
      },
      this.ruleSchema.Columns.CountOpen,
      {
        ColumnName: 'recalculate',
        Type: ValType.String,
        afterAdditionals: true,
        untranslatedDisplay: '#LDS#Recalculate',
      },
    ];
  }

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      this.dataModel = await this.rulesProvider.getDataModel();
      this.viewConfig = await this.viewConfigService.getInitialDSTExtension(this.dataModel, this.viewConfigPath);
      this.isMControlPerViolation = (await this.rulesProvider.featureConfig()).MitigatingControlsPerViolation;

      this.canRecalculate = await this.permissionService.isRuleStatistics();

      if (!this.canRecalculate) {
        this.displayedColumns.pop();
      }
      await this.getData();
    } finally {
      isBusy.endBusy();
    }
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

  public async showDetails(entity: PortalRules): Promise<void> {
    const selectedRule = entity;
    this.rulesProvider.handleOpenLoader();
    let mControls: RulesMitigatingControls[];
    try {
      mControls = (await this.mControlsProvider.getControls(selectedRule.GetEntity().GetColumn('UID_NonCompliance').GetValue())).Data;
    } finally {
      this.rulesProvider.handleCloseLoader();
    }

    const hasRiskIndex = !!(await this.systemInfoService.get()).PreProps?.includes('RISKINDEX');

    await this.sideSheetService
      .open(RulesSidesheetComponent, {
        title: await this.translate.get('#LDS#Heading View Compliance Rule Details').toPromise(),
        subTitle: selectedRule.GetEntity().GetDisplay(),
        padding: '0px',
        width: calculateSidesheetWidth(1200, 0.7),
        testId: 'rule-details-sidesheet',
        data: {
          selectedRule,
          isMControlPerViolation: this.isMControlPerViolation,
          hasRiskIndex,
          mControls,
          canEdit: this.canRecalculate && false, // TODO: When API can handle permission Update canEdit or remove "&& false" PBI: 305793
        },
      })
      .afterClosed()
      .toPromise();
  }

  public async recalculateRule(selectedRule: PortalRules): Promise<void> {
    this.rulesProvider.handleOpenLoader();
    try {
      await this.rulesProvider.recalculate(selectedRule.GetEntity().GetKeys().join(','));
      await this.dataSource.updateState();
    } finally {
      this.rulesProvider.handleCloseLoader();
    }
  }

  public async getData(): Promise<void> {
    const dataViewInitParameters: DataViewInitParameters<PortalRules> = {
      execute: (params: CollectionLoadParameters, signal: AbortSignal): Promise<TypedEntityCollectionData<PortalRules>> =>
        this.rulesProvider.getRules(params, signal),
      schema: this.ruleSchema,
      columnsToDisplay: this.displayedColumns,
      dataModel: this.dataModel,
      exportFunction: this.rulesProvider.exportRules(this.dataSource.state()),
      viewConfig: this.viewConfig,
      highlightEntity: (identity: PortalRules) => {
        this.showDetails(identity);
      },
    };
    this.dataSource.init(dataViewInitParameters);
  }
}
