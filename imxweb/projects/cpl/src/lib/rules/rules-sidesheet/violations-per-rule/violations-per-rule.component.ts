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
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { ComplianceFeatureConfig, PortalRules } from '@imx-modules/imx-api-cpl';
import { CollectionLoadParameters, EntitySchema, TypedEntity } from '@imx-modules/imx-qbm-dbts';
import { calculateSidesheetWidth, DataModelWrapper, DataSourceToolbarSettings, DataSourceWrapper, DataTableGroupedData } from 'qbm';
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
  public dstSettings: DataSourceToolbarSettings | undefined;
  public groupedData: { [key: string]: DataTableGroupedData } = {};

  public entitySchema: EntitySchema;

  @Input() public uidRule: string;

  constructor(
    private readonly rulesViolationsService: RulesViolationsService,
    private readonly translate: TranslateService,
    private readonly sidesheet: EuiSidesheetService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.entitySchema = this.rulesViolationsService.rulesViolationsApproveSchema;

    this.dataModelWrapper = {
      dataModel: await this.rulesViolationsService.getDataModel(),
      getGroupInfo: (parameters) => this.rulesViolationsService.getGroupInfo(parameters),
      groupingFilterOptions: ['state'],
    };

    this.dstWrapper = new DataSourceWrapper(
      (state) =>
        this.rulesViolationsService.getRulesViolationsApprove({ ...state, ...{ uid_compliancerule: this.uidRule, approvable: undefined } }),
      [
        this.entitySchema.Columns.UID_Person,
        this.entitySchema.Columns.State,
        this.entitySchema.Columns.RiskIndexCalculated,
        this.entitySchema.Columns.RiskIndexReduced,
      ],
      this.entitySchema,
      this.dataModelWrapper,
    );

    await this.getData();
  }

  /**
   * Handles grouping changes with reload
   * @param groupKey The key of the group
   */
  public async onGroupingChange(groupKey: string): Promise<void> {
    this.rulesViolationsService.handleOpenLoader();
    try {
      const groupedData = this.groupedData[groupKey];
      groupedData.data = await this.rulesViolationsService.getRulesViolationsApprove(groupedData.navigationState);
      groupedData.settings = {
        displayedColumns: this.dstSettings?.displayedColumns,
        dataModel: this.dstSettings?.dataModel,
        dataSource: groupedData.data,
        entitySchema: this.entitySchema,
        navigationState: groupedData.navigationState || {},
      };
    } finally {
      this.rulesViolationsService.handleCloseLoader();
    }
  }

  /**
   * Opens rules-violations-details sidesheet, where you can manage the selected rule.
   * @param rule The selected rule from the Rule Violations list
   */
  public async showRulesViolationsDetail(entity: TypedEntity) {
    this.rulesViolationsService.handleOpenLoader();
    const rule = entity as RulesViolationsApproval;
    let complianceRule: PortalRules;
    let config: ComplianceFeatureConfig;
    try {
      complianceRule = await this.rulesViolationsService.getComplianceRuleByUId(rule);
      config = await this.rulesViolationsService.featureConfig();
    } finally {
      this.rulesViolationsService.handleCloseLoader();
    }
    await this.sidesheet
      .open(RulesViolationsDetailsComponent, {
        title: await this.translate.get('#LDS#Heading View Rule Violation Details').toPromise(),
        subTitle: rule.GetEntity().GetDisplay(),
        padding: '0px',
        width: calculateSidesheetWidth(1000),
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
  public async getData(parameter?: CollectionLoadParameters): Promise<void> {
    this.rulesViolationsService.handleOpenLoader();
    try {
      this.dstSettings = await this.dstWrapper.getDstSettings(parameter);
    } finally {
      this.rulesViolationsService.handleCloseLoader();
    }
  }
}
