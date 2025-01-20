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

import { Injectable } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { PolicyConfig, PortalPoliciesViolations, PortalPoliciesViolationslist, V2ApiClientMethodFactory } from '@imx-modules/imx-api-pol';
import { DecisionInput } from '@imx-modules/imx-api-qer';
import {
  CollectionLoadParameters,
  DataModel,
  EntityCollectionData,
  EntityKeysData,
  EntitySchema,
  ExtendedTypedEntityCollection,
  GroupInfoData,
  MethodDefinition,
  MethodDescriptor,
  TypedEntityCollectionData,
  ValType,
} from '@imx-modules/imx-qbm-dbts';
import { BaseCdr, calculateSidesheetWidth, DataSourceToolbarExportMethod, EntityService, SnackBarService } from 'qbm';
import { JustificationService, JustificationType, UserModelService } from 'qer';
import { ApiService } from '../api.service';
import { PolicyViolation } from './policy-violation';
import { PolicyViolationsActionParameters } from './policy-violations-action/policy-violations-action-parameters.interface';
import { PolicyViolationsActionComponent } from './policy-violations-action/policy-violations-action.component';

@Injectable({
  providedIn: 'root',
})
export class PolicyViolationsService {
  public readonly applied = new Subject<void>();

  constructor(
    public readonly justificationService: JustificationService,
    private readonly api: ApiService,
    private readonly busyService: EuiLoadingService,
    private readonly entityService: EntityService,
    private readonly translate: TranslateService,
    private readonly snackBar: SnackBarService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly userService: UserModelService,
  ) {}

  public get policyViolationsSchema(): EntitySchema {
    return this.api.typedClient.PortalPoliciesViolationslist.GetSchema();
  }

  public get mitigationSchema(): EntitySchema {
    return this.api.typedClient.PortalPoliciesViolations.GetSchema();
  }

  public async getConfig(): Promise<PolicyConfig> {
    return this.api.client.portal_policy_config_get();
  }

  public getPolicyViolationsDataModel(): Promise<DataModel> {
    return this.api.client.portal_policies_violations_datamodel_get();
  }

  public async get(
    isApprovable: boolean,
    polDecisionParameters?: CollectionLoadParameters,
    signal?: AbortSignal,
  ): Promise<TypedEntityCollectionData<PolicyViolation>> {
    const collection = await this.api.typedClient.PortalPoliciesViolationslist.Get_list(
      {
        approvable: isApprovable,
        ...polDecisionParameters,
      },
      { signal },
    );
    return {
      tableName: collection.tableName,
      totalCount: collection.totalCount,
      Data: collection.Data.map((item: PortalPoliciesViolationslist, index: number) => {
        const extendedData = collection?.extendedData?.RelatedObjects?.[index] || [];
        return new PolicyViolation(item, extendedData);
      }),
    };
  }

  public exportPolicyViolations(): DataSourceToolbarExportMethod {
    const factory = new V2ApiClientMethodFactory();
    return {
      getMethod: (withProperties: string, navigationState: CollectionLoadParameters, PageSize?: number) => {
        let method: MethodDescriptor<EntityCollectionData>;
        if (PageSize) {
          method = factory.portal_policies_violations_list_get({ ...navigationState, withProperties, PageSize, StartIndex: 0 });
        } else {
          method = factory.portal_policies_violations_list_get({ ...navigationState, withProperties });
        }
        return new MethodDefinition(method);
      },
    };
  }

  public getGroupInfo(
    parameters: { by?: string; def?: string } & CollectionLoadParameters = {},
    signal?: AbortSignal,
  ): Promise<GroupInfoData> {
    const { withProperties, OrderBy, search, ...params } = parameters;
    return this.api.client.portal_policies_violations_group_list_get(
      {
        ...params,
        withcount: true,
      },
      { signal },
    );
  }

  // Methods for decision making

  public async approve(policyViolations: PolicyViolation[]): Promise<boolean> {
    let justification: BaseCdr | undefined;
    this.showBusyIndicator();

    try {
      justification = await this.justificationService.createCdr(JustificationType.approvePolicyViolation);
    } finally {
      this.busyService.hide();
    }

    const actionParameters: PolicyViolationsActionParameters = {
      justification,
      reason: this.createCdrReason(justification ? '#LDS#Additional comments about your decision' : undefined),
    };

    return this.editAction({
      title: policyViolations.length > 1 ? '#LDS#Heading Grant Exceptions' : '#LDS#Heading Grant Exception',
      message: '#LDS#Exceptions have been successfully granted for {0} policy violations.',
      discardChangesOnAbort: true,
      data: {
        policyViolations,
        approve: true,
        actionParameters,
      },
      apply: async (violation: PolicyViolation) => {
        await this.makeDecision(violation, {
          Reason: actionParameters.reason.column.GetValue(),
          UidJustification: actionParameters.justification?.column?.GetValue(),
          Decision: true,
        });
      },
    });
  }

  public async deny(policyViolations: PolicyViolation[]): Promise<boolean> {
    let justification: BaseCdr | undefined;

    this.showBusyIndicator();

    try {
      justification = await this.justificationService.createCdr(JustificationType.denyPolicyViolation);
    } finally {
      this.busyService.hide();
    }

    const actionParameters: PolicyViolationsActionParameters = {
      justification,
      reason: this.createCdrReason(justification ? '#LDS#Additional comments about your decision' : undefined),
    };

    return this.editAction({
      title: policyViolations.length > 1 ? '#LDS#Heading Deny Exceptions' : '#LDS#Heading Deny Exception',
      message: '#LDS#Exceptions have been successfully denied for {0} policy violations.',
      discardChangesOnAbort: true,
      data: {
        policyViolations,
        actionParameters,
        customValidation: undefined,
      },
      apply: async (policyViolation: PolicyViolation) => {
        try {
          await policyViolation.GetEntity().Commit(true);
          await this.makeDecision(policyViolation, {
            Reason: actionParameters.reason.column.GetValue(),
            UidJustification: actionParameters.justification?.column?.GetValue(),
            Decision: false,
          });
        } catch (error) {
          await policyViolation.GetEntity().DiscardChanges();
          throw error;
        }
      },
    });
  }

  public async getMitigatingContols(uidObject: string): Promise<ExtendedTypedEntityCollection<PortalPoliciesViolations, unknown>> {
    return this.api.typedClient.PortalPoliciesViolations.Get(uidObject);
  }

  public async getCandidates(uid: string, data: EntityKeysData, parameter?: CollectionLoadParameters) {
    return this.api.client.portal_policies_violations_UID_MitigatingControl_candidates_post(uid, data, parameter);
  }

  public createMitigatingControl(uid: string): PortalPoliciesViolations {
    const entity = this.api.typedClient.PortalPoliciesViolations.createEntity({
      Columns: {
        UID_QERPolicyHasObject: { Value: uid },
      },
    });
    return entity;
  }

  public async deleteMitigationControl(uidPolicaHasObject: string, uidMitigating: string): Promise<boolean> {
    try {
      await this.api.typedClient.PortalPoliciesViolations.Delete(uidPolicaHasObject, uidMitigating);
      return true;
    } catch (except) {
      return false;
    }
  }

  private async makeDecision(pwo: PolicyViolation, decision: DecisionInput): Promise<void> {
    await this.api.client.portal_policies_violations_approve_post(pwo.GetEntity().GetKeys()[0], decision);
  }

  private createCdrReason(display?: string): BaseCdr {
    const column = this.entityService.createLocalEntityColumn({
      ColumnName: 'ReasonHead',
      Type: ValType.Text,
      IsMultiLine: true,
    });

    return new BaseCdr(column, display || '#LDS#Reason for your decision');
  }

  private async editAction(config: any): Promise<boolean> {
    const result = await this.sideSheet
      .open(PolicyViolationsActionComponent, {
        title: await this.translate.get(config.title).toPromise(),
        subTitle: config.data.policyViolations.length === 1 ? config.data.policyViolations[0].GetEntity().GetDisplay() : '',
        padding: '0',
        width: calculateSidesheetWidth(600, 0.4),
        testId: `policy-violations-action-${config.data.approve ? 'approve' : 'deny'}`,
        data: config.data,
      })
      .afterClosed()
      .toPromise();

    if (result) {
      this.showBusyIndicator();

      let success: boolean;
      try {
        for (const policyViolation of config.data.policyViolations) {
          await config.apply(policyViolation);
        }
        success = true;
        await this.userService.reloadPendingItems();
      } finally {
        this.busyService.hide();
      }

      if (success) {
        this.snackBar.open({
          key: config.message,
          parameters: [
            config.data.policyViolations.length,
            config.data.actionParameters.uidPerson ? config.data.actionParameters.uidPerson.column.GetDisplayValue() : '',
          ],
        });
        this.applied.next();
      }
    } else {
      if (config.discardChangesOnAbort) {
        for (const approval of config.data.policyViolations) {
          await approval.GetEntity().DiscardChanges();
        }
      }
      this.snackBar.open({ key: '#LDS#You have canceled the action.' });
    }

    return result;
  }

  private showBusyIndicator(): void {
    if (this.busyService.overlayRefs.length === 0) {
      this.busyService.show();
    }
  }
}
