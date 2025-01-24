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

import { Component, OnInit } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { PortalRules } from 'imx-api-cpl';
import { CplPermissionsService } from './admin/cpl-permissions.service';
import { ViewConfigData } from 'imx-api-qer';
import { CollectionLoadParameters, DataModel, DisplayColumns, EntitySchema, ValType } from 'imx-qbm-dbts';
import {
  DataSourceToolbarFilter,
  DataSourceToolbarSettings,
  ClientPropertyForTableColumns,
  DataSourceToolbarViewConfig,
  SystemInfoService,
  BusyService,
} from 'qbm';
import { ViewConfigService } from 'qer';
import { MitigatingControlsRulesService } from './mitigating-controls-rules/mitigating-controls-rules.service';
import { RulesMitigatingControls } from './mitigating-controls-rules/rules-mitigating-controls';
import { RuleParameter } from './rule-parameter';
import { RulesSidesheetComponent } from './rules-sidesheet/rules-sidesheet.component';
import { RulesService } from './rules.service';

@Component({
  selector: 'imx-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss'],
})
export class RulesComponent implements OnInit {
  public dstSettings: DataSourceToolbarSettings;
  public readonly DisplayColumns = DisplayColumns;
  public ruleSchema: EntitySchema;
  public isMControlPerViolation: boolean;

  public busyService = new BusyService();

  private displayedColumns: ClientPropertyForTableColumns[] = [];
  private dataModel: DataModel;
  private filterOptions: DataSourceToolbarFilter[] = [];
  private navigationState: RuleParameter = {};
  public canRecalculate = false;
  private viewConfig: DataSourceToolbarViewConfig;
  private viewConfigPath = 'rules';

  constructor(
    private readonly rulesProvider: RulesService,
    private viewConfigService: ViewConfigService,
    private readonly mControlsProvider: MitigatingControlsRulesService,
    private readonly sideSheetService: EuiSidesheetService,
    private readonly systemInfoService: SystemInfoService,
    private readonly translate: TranslateService,
    private readonly permissionService: CplPermissionsService
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
      this.filterOptions = this.dataModel.Filters;
      this.viewConfig = await this.viewConfigService.getInitialDSTExtension(this.dataModel, this.viewConfigPath);
      this.isMControlPerViolation = (await this.rulesProvider.featureConfig()).MitigatingControlsPerViolation;

      // We will check the configs for default state only on init
      if (!this.viewConfigService.isDefaultConfigSet()) {
        // If we have no default settings, we have a default
        const indexActive = this.filterOptions.findIndex((elem) => elem.Name === 'active');
        if (indexActive > -1) {
          this.filterOptions[indexActive].InitialValue = '1';
          this.navigationState.active = '1';
        }
      }

      this.canRecalculate = await this.permissionService.isRuleStatistics();

      if (!this.canRecalculate) {
        this.displayedColumns.pop();
      }
      await this.navigate({});
    } finally {
      isBusy.endBusy();
    }
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

  public async showDetails(selectedRule: PortalRules): Promise<void> {
    this.rulesProvider.handleOpenLoader();
    const hasRiskIndex = (await this.systemInfoService.get()).PreProps?.includes('RISKINDEX');

    let mControls: RulesMitigatingControls[] = [];
    try {
      if (hasRiskIndex) {
        mControls = (await this.mControlsProvider.getControls(selectedRule.GetEntity().GetColumn('UID_NonCompliance').GetValue())).Data;
      }
    } finally {
      this.rulesProvider.handleCloseLoader();
    }

    await this.sideSheetService
      .open(RulesSidesheetComponent, {
        title: await this.translate.get('#LDS#Heading View Compliance Rule Details').toPromise(),
        subTitle: selectedRule.GetEntity().GetDisplay(),
        padding: '0px',
        width: 'max(1200px, 80%)',
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
      await this.navigate(this.navigationState);
    } finally {
      this.rulesProvider.handleCloseLoader();
    }
  }

  public async navigate(parameter: CollectionLoadParameters): Promise<void> {
    this.navigationState = { ...this.navigationState, ...parameter };

    const isBusy = this.busyService.beginBusy();
    try {
      const data = await this.rulesProvider.getRules(this.navigationState);
      if (data) {
        const exportMethod = this.rulesProvider.exportRules(this.navigationState);
        exportMethod.initialColumns = this.displayedColumns.map((col) => col.ColumnName);
        this.dstSettings = {
          displayedColumns: this.displayedColumns,
          dataSource: data,
          dataModel: this.dataModel,
          entitySchema: this.ruleSchema,
          navigationState: this.navigationState,
          filters: this.filterOptions,
          viewConfig: this.viewConfig,
          exportMethod,
        };
      }
    } finally {
      isBusy.endBusy();
    }
  }

  public onSearch(keywords: string): Promise<void> {
    this.rulesProvider.abortCall();
    return this.navigate({ search: keywords });
  }
}
