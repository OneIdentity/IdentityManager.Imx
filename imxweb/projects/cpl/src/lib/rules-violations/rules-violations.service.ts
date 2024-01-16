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
import { Injectable } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { ComplianceFeatureConfig, PortalRules, PortalRulesViolations, V2ApiClientMethodFactory } from 'imx-api-cpl';
import {
  CollectionLoadParameters,
  CompareOperator,
  DataModel,
  EntityCollectionData,
  EntitySchema,
  ExtendedTypedEntityCollection,
  FilterData,
  FilterType,
  GroupInfoData,
  MethodDefinition,
  MethodDescriptor,
} from 'imx-qbm-dbts';

import { ClassloggerService, DataSourceToolbarExportMethod, SystemInfoService } from 'qbm';
import { ApiService } from '../api.service';
import { RulesViolationsApproval } from './rules-violations-approval';
import { RulesViolationsLoadParameters } from './rules-violations-load-parameters.interface';

/**
 * Service that provides all rules violations, including schema, DataModel and GroupingInfo.
 */
@Injectable({
  providedIn: 'root',
})
export class RulesViolationsService {
  private busyIndicator: OverlayRef;
  private busyIndicatorCounter = 0;

  constructor(
    private readonly cplClient: ApiService,
    private readonly logger: ClassloggerService,
    private readonly busyService: EuiLoadingService,
    private readonly translate: TranslateService,
    private readonly systemInfoService: SystemInfoService
  ) {}

  public async featureConfig(): Promise<ComplianceFeatureConfig> {
    return this.cplClient.client.portal_compliance_config_get();
  }

  /**
   * Provides the schema of {@link PortalRulesViolations}.
   */
  public get rulesViolationsApproveSchema(): EntitySchema {
    return this.cplClient.typedClient.PortalRulesViolations.GetSchema();
  }

  /**
   * Provides the data model of {@link PortalRulesViolations}.
   */
  public async getDataModel(filter?: FilterData[]): Promise<DataModel> {
    const options = { filter };
    return this.cplClient.client.portal_rules_violations_datamodel_get(options);
  }

  /**
   * Provides the GroupInfo of {@link PortalRulesViolations}.
   */
  public getGroupInfo(parameters: RulesViolationsLoadParameters = {}): Promise<GroupInfoData> {
    const { withProperties, OrderBy, search, ...params } = parameters;
    return this.cplClient.client.portal_rules_violations_group_get({
      ...params,
      withcount: true,
      approvable: true,
    });
  }

  /**
   * Retrieves all rule violations, that the current user can approve or deny.
   *
   * @returns a list of {@link PortalRulesViolations|PortalRulesViolationss}
   */
  public async getRulesViolationsApprove(
    parameters?: CollectionLoadParameters
  ): Promise<ExtendedTypedEntityCollection<RulesViolationsApproval, unknown>> {
    this.logger.debug(this, `Retrieving all rule violations to approve`);
    this.logger.trace('Navigation state', parameters);
    const collection = await this.cplClient.typedClient.PortalRulesViolations.Get({
      approvable: true,
      ...parameters,
    });

    const hasRiskIndex = (await this.systemInfoService.get()).PreProps.includes('RISKINDEX');
    return {
      tableName: collection.tableName,
      totalCount: collection.totalCount,
      Data: collection.Data.map((item: PortalRulesViolations) => new RulesViolationsApproval(item, hasRiskIndex, this.translate)),
    };
  }

  public exportRulesViolations(parameters: CollectionLoadParameters): DataSourceToolbarExportMethod {
    const factory = new V2ApiClientMethodFactory();
    return {
      getMethod: (withProperties: string, PageSize?: number) => {
        let method: MethodDescriptor<EntityCollectionData>;
        if (PageSize) {
          method = factory.portal_rules_violations_get({ ...parameters, withProperties, PageSize, StartIndex: 0 });
        } else {
          method = factory.portal_rules_violations_get({ ...parameters, withProperties });
        }
        return new MethodDefinition(method);
      },
    };
  }

  /**
   * Shows the busy indicator.
   */
  public handleOpenLoader(): void {
    if (this.busyIndicatorCounter === 0) {
      setTimeout(() => (this.busyIndicator = this.busyService.show()));
    }
    this.busyIndicatorCounter++;
  }

  /**
   * Closes the busy indicator.
   */
  public handleCloseLoader(): void {
    if (this.busyIndicatorCounter === 1) {
      setTimeout(() => {
        this.busyService.hide(this.busyIndicator);
        this.busyIndicator = undefined;
      });
    }
    this.busyIndicatorCounter--;
  }

  public async getComplianceRuleByUId(rulesViolationsApproval: RulesViolationsApproval): Promise<PortalRules> {
    const uidNonCompliance = rulesViolationsApproval.GetEntity().GetColumn('UID_NonCompliance').GetValue();
    const call = await this.cplClient.typedClient.PortalRules.Get({
      filter: [
        { ColumnName: 'UID_NonCompliance', CompareOp: CompareOperator.Equal, Type: FilterType.Compare, Value1: uidNonCompliance },
        { ColumnName: 'isWorkingcopy', CompareOp: CompareOperator.Equal, Type: FilterType.Compare, Value1: false },
      ],
    });
    return call.Data[0];
  }
}
