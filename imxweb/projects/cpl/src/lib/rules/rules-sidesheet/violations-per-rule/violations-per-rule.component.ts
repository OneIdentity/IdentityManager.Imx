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

import { Component, Input, OnInit } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { CollectionLoadParameters, EntitySchema } from 'imx-qbm-dbts';
import { DataModelWrapper, DataSourceToolbarSettings, DataSourceWrapper, DataTableGroupedData } from 'qbm';
import { RulesViolationsApproval } from '../../../rules-violations/rules-violations-approval';
import { RulesViolationsDetailsComponent } from '../../../rules-violations/rules-violations-details/rules-violations-details.component';
import { RulesViolationsService } from '../../../rules-violations/rules-violations.service';

@Component({
  selector: 'imx-violations-per-rule',
  templateUrl: './violations-per-rule.component.html',
  styleUrls: ['./violations-per-rule.component.scss'],
})
export class ViolationsPerRuleComponent implements OnInit {
  public dataModelWrapper: DataModelWrapper;
  public dstWrapper: DataSourceWrapper<RulesViolationsApproval>;
  public dstSettings: DataSourceToolbarSettings;
  public groupedData: { [key: string]: DataTableGroupedData } = {};

  public entitySchema: EntitySchema;

  @Input() public uidRule: string;

  constructor(
    private readonly rulesViolationsService: RulesViolationsService,
    private readonly translate: TranslateService,
    private readonly sidesheet: EuiSidesheetService
  ) {}

  async ngOnInit(): Promise<void> {
    this.entitySchema = this.rulesViolationsService.rulesViolationsApproveSchema;

    this.dataModelWrapper = {
      dataModel: await this.rulesViolationsService.getDataModel(),
      getGroupInfo: (parameters) => this.rulesViolationsService.getGroupInfo(parameters),
      groupingFilterOptions: ['state'],
    };

    this.dstWrapper = new DataSourceWrapper(
      (state, requestOpts, isInitial) =>
        isInitial
          ? Promise.resolve({ totalCount: 0, Data: [] })
          : this.rulesViolationsService.getRulesViolationsApprove(
              { ...state, ...{ uid_compliancerule: this.uidRule, approvable: undefined } },
              requestOpts
            ),
      [
        this.entitySchema.Columns.UID_Person,
        this.entitySchema.Columns.State,
        this.entitySchema.Columns.RiskIndexCalculated,
        this.entitySchema.Columns.RiskIndexReduced,
      ],
      this.entitySchema,
      this.dataModelWrapper
    );

    await this.getData(undefined, true);
  }

  /**
   * Handles grouping changes with reload
   * @param groupKey The key of the group
   */
  public async onGroupingChange(groupInfo: { key: string; isInitial: boolean }): Promise<void> {
    this.rulesViolationsService.handleOpenLoader();
    try {
      const groupedData = this.groupedData[groupInfo.key];
      groupedData.data = groupInfo.isInitial
        ? { totalCount: 0, Data: [] }
        : await this.rulesViolationsService.getRulesViolationsApprove(groupedData.navigationState);
      groupedData.settings = {
        displayedColumns: this.dstSettings.displayedColumns,
        dataModel: this.dstSettings.dataModel,
        dataSource: groupedData.data,
        entitySchema: this.dstSettings.entitySchema,
        navigationState: groupedData.navigationState,
      };
    } finally {
      this.rulesViolationsService.handleCloseLoader();
    }
  }

  /**
   * Opens rules-violations-details sidesheet, where you can manage the selected rule.
   * @param rule The selected rule from the Rule Violations list
   */
  public async showRulesViolationsDetail(rule: RulesViolationsApproval) {
    const complianceRule = await this.rulesViolationsService.getComplianceRuleByUId(rule);
    const config = await this.rulesViolationsService.featureConfig();
    await this.sidesheet
      .open(RulesViolationsDetailsComponent, {
        title: await this.translate.get('#LDS#Heading View Rule Violation Details').toPromise(),
        subTitle: rule.GetEntity().GetDisplay(),
        padding: '0px',
        width: 'max(1000px, 70%)',
        testId: 'rules-violations-informations-sidesheet',
        data: {
          selectedRulesViolation: rule,
          isMControlPerViolation: config.MitigatingControlsPerViolation,
          complianceRule,
        },
      })
      .afterClosed()
      .toPromise();
  }

  /**
   * Loads the dstSettings with load parameters
   * @param parameter Load parameter
   */
  public async getData(parameter?: CollectionLoadParameters, isInitialLoad: boolean = false): Promise<void> {
    this.rulesViolationsService.handleOpenLoader();
    try {
      const dstSettings = await this.dstWrapper.getDstSettings(
        parameter,
        { signal: this.rulesViolationsService.abortController.signal },
        isInitialLoad
      );
      if (dstSettings) {
        this.dstSettings = dstSettings;
      }
    } finally {
      this.rulesViolationsService.handleCloseLoader();
    }
  }

  public onSearch(keywords: string): Promise<void> {
    this.rulesViolationsService.abortCall();
    return this.getData({ search: keywords });
  }
}
