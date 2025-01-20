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
import { EuiDownloadOptions } from '@elemental-ui/core';

import {
  ApiClientMethodFactory,
  AttestationCaseData,
  DecisionInput,
  DenyDecisionInput,
  DirectDecisionInput,
  EntitlementLossDto,
  OtherApproverInput,
  PortalAttestationApprove,
  PortalAttestationCaseHistory,
  PwoQueryInput,
  ReasonInput,
  V2ApiClientMethodFactory,
} from '@imx-modules/imx-api-att';
import {
  CollectionLoadParameters,
  DataModel,
  EntityCollectionData,
  EntitySchema,
  FilterTreeData,
  GroupInfoData,
  IReadValue,
  MethodDefinition,
  MethodDescriptor,
  TypedEntity,
  TypedEntityBuilder,
  TypedEntityCollectionData,
} from '@imx-modules/imx-qbm-dbts';
import { AppConfigService, DataSourceToolbarExportMethod, ElementalUiConfigService } from 'qbm';
import { ApproverContainer, ParameterDataLoadParameters, ParameterDataService } from 'qer';
import { ApiService } from '../api.service';
import { AttestationCaseLoadParameters } from '../attestation-history/attestation-case-load-parameters.interface';
import { AttestationHistoryCase } from '../attestation-history/attestation-history-case';
import { Approvers } from './approvers.interface';
import { AttestationCase } from './attestation-case';
import { AttestationDecisionLoadParameters } from './attestation-decision-load-parameters';

@Injectable({
  providedIn: 'root',
})
export class AttestationCasesService {
  public isChiefApproval: boolean;
  private readonly historyBuilder = new TypedEntityBuilder(PortalAttestationCaseHistory);
  private readonly apiClientMethodFactory = new ApiClientMethodFactory();

  constructor(
    private readonly attClient: ApiService,
    private readonly parameterDataService: ParameterDataService,
    private readonly elementalUiConfigService: ElementalUiConfigService,
    private readonly config: AppConfigService,
  ) {}

  public get attestationApproveSchema(): EntitySchema {
    return this.attClient.typedClient.PortalAttestationApprove.GetSchema();
  }

  public get attestationCaseSchema(): EntitySchema {
    return this.attClient.typedClient.PortalAttestationCase.GetSchema();
  }

  public async get(
    attDecisionParameters?: AttestationDecisionLoadParameters,
    signal?: AbortSignal,
  ): Promise<TypedEntityCollectionData<AttestationCase>> {
    const collection = await this.attClient.typedClient.PortalAttestationApprove.Get(attDecisionParameters, { signal });
    if (!collection) return { totalCount: 0, Data: [] };
    return {
      tableName: collection.tableName,
      totalCount: collection.totalCount,
      Data: collection.Data.map((item: PortalAttestationApprove, index: number) => {
        const parameterDataContainer = this.parameterDataService.createContainer(
          item.GetEntity(),
          { ...collection.extendedData, ...{ index } },
          (parameters) => this.getParameterCandidates(parameters),
          (treefilterparameter) => this.getFilterTree(treefilterparameter),
        );

        return new AttestationCase(item, parameterDataContainer, { ...collection?.extendedData, ...{ index } });
      }),
    };
  }

  public exportData(): DataSourceToolbarExportMethod {
    const factory = new V2ApiClientMethodFactory();
    return {
      getMethod: (withProperties: string, navigationState: CollectionLoadParameters, PageSize?: number) => {
        let method: MethodDescriptor<EntityCollectionData>;
        if (PageSize) {
          method = factory.portal_attestation_approve_get({ ...navigationState, withProperties, PageSize, StartIndex: 0 });
        } else {
          method = factory.portal_attestation_approve_get({ ...navigationState, withProperties });
        }
        return new MethodDefinition(method);
      },
    };
  }

  public async getNumberOfPending(parameters: AttestationCaseLoadParameters): Promise<number> {
    const pendingAttestations = await this.attClient.typedClient.PortalAttestationApprove.Get({
      ...parameters,
      ...{ PageSize: -1 },
    });

    return pendingAttestations?.totalCount ?? 0;
  }

  public async getDataModel(): Promise<DataModel> {
    return this.attClient.client.portal_attestation_approve_datamodel_get({ Escalation: this.isChiefApproval });
  }

  public getGroupInfo(parameters: { by?: string; def?: string } & CollectionLoadParameters = {}): Promise<GroupInfoData> {
    const { withProperties, OrderBy, search, ...params } = parameters;
    return this.attClient.client.portal_attestation_approve_group_get({ ...params, withcount: true, Escalation: this.isChiefApproval });
  }

  public async getApprovers(
    attestationCase:
      | (TypedEntity & {
          DecisionLevel: IReadValue<number>;
          UID_QERWorkingMethod: IReadValue<string>;
          data: AttestationCaseData;
        })
      | AttestationHistoryCase
      | AttestationCase,
  ): Promise<Approvers> {
    const pwoData = {
      WorkflowHistory: attestationCase.data?.WorkflowHistory,
      WorkflowData: attestationCase.data?.WorkflowData,
      WorkflowSteps: attestationCase.data?.WorkflowSteps,
    };
    const approverContainer = new ApproverContainer({
      decisionLevel: attestationCase.DecisionLevel.value,
      qerWorkingMethod: attestationCase.UID_QERWorkingMethod.value,
      pwoData,
      approvers:
        (await this.attClient.client.portal_attestation_persondecision_get(this.getKey(attestationCase))).Entities?.map(
          (item) => item.Columns?.UID_Person.Value,
        ) || [],
    });

    return {
      current: approverContainer.approverNow,
      future: approverContainer.approverFuture,
      canSeeSteps: approverContainer.canSeeSteps,
    };
  }

  public createHistoryTypedEntities(data?: AttestationCaseData): TypedEntityCollectionData<PortalAttestationCaseHistory> {
    return this.historyBuilder.buildReadWriteEntities(
      data?.WorkflowHistory || { TotalCount: 0 },
      this.attClient.typedClient.PortalAttestationCaseHistory.GetSchema(),
    );
  }

  public async getLossPreviewEntities(attestationCase: AttestationCase): Promise<EntitlementLossDto[]> {
    const key = this.getKey(attestationCase);
    return this.attClient.client.portal_attestation_approve_losspreview_get(key);
  }

  public getReportDownloadOptions(attestationCase: TypedEntity): EuiDownloadOptions {
    const key = this.getKey(attestationCase);
    return {
      ...this.elementalUiConfigService.Config.downloadOptions,
      url: this.config.BaseUrl + new MethodDefinition(this.apiClientMethodFactory.portal_attestation_report_get(key)).path,
      fileName: `${key}.pdf`,
    };
  }

  /**
   * Approve or deny the attestation case
   * @param attestationCase The attestation case
   * @param input reason and/or standard reason
   */
  public async makeDecision(attestationCase: PortalAttestationApprove, input: DecisionInput): Promise<any> {
    return this.attClient.client.portal_attestation_decide_post(this.getKey(attestationCase), input);
  }

  /**
   * Entscheidungsworkflow auf einen bestimmten Schritt setzen
   * @param attestationCase The attestation case
   * @param input reason and/or standard reason
   */
  public async directDecision(attestationCase: PortalAttestationApprove, input: DirectDecisionInput): Promise<any> {
    return this.attClient.client.portal_attestation_directdecision_post(this.getKey(attestationCase), input);
  }

  public async escalateDecision(attestationCase: PortalAttestationApprove, input: ReasonInput): Promise<any> {
    return this.attClient.client.portal_attestation_escalate_post(this.getKey(attestationCase), input);
  }

  /**
   * Eine andere Person zusätzlich zur mir zur Entscheidung berechtigen
   * @param attestationCase The attestation case
   * @param input reason and/or standard reason
   */
  public async addAdditional(attestationCase: PortalAttestationApprove, input: OtherApproverInput): Promise<any> {
    return this.attClient.client.portal_attestation_additional_post(this.getKey(attestationCase), input);
  }

  /**
   * Eine andere Person an meiner Stelle (ersetzend) zur Entscheidung berechtigen
   * @param attestationCase The attestation case
   * @param input reason and/or standard reason
   */
  public async addInsteadOf(attestationCase: PortalAttestationApprove, input: OtherApproverInput): Promise<any> {
    return this.attClient.client.portal_attestation_insteadof_post(this.getKey(attestationCase), input);
  }

  /**
   * Zurücknehmen von AddAdditional oder AddInsteadOf
   * @param attestationCase The attestation case
   * @param input reason and/or standard reason
   */
  public async revokeDelegation(attestationCase: TypedEntity, input: ReasonInput): Promise<any> {
    return this.attClient.client.portal_attestation_revokedelegation_post(this.getKey(attestationCase), input);
  }

  public async askForHelp(attestationCase: PortalAttestationApprove, para: PwoQueryInput): Promise<void> {
    await this.attClient.client.portal_attestation_query_post(this.getKey(attestationCase), para);
  }

  public async recallInquiry(attestationCase: PortalAttestationApprove, reason: ReasonInput): Promise<void> {
    return this.attClient.client.portal_attestation_recallquery_post(this.getKey(attestationCase), reason);
  }
  public async resetReservation(attestationCase: PortalAttestationApprove, reason: ReasonInput): Promise<void> {
    return this.attClient.client.portal_attestation_resetreservation_post(this.getKey(attestationCase), reason);
  }

  /**
   *
   * @param attestation The case which should be answered to
   * @param answerInput the text for reasoning
   */
  public async answerQuestion(attestation: PortalAttestationApprove, answerInput: string): Promise<void> {
    return this.attClient.client.portal_attestation_answerquery_post(this.getKey(attestation), { Reason: answerInput });
  }

  /**
   * Zurücknehmen von AddAdditional oder AddInsteadOf
   * @param attestationCase The attestation case
   * @param input reason and/or standard reason
   */
  public async revokeAdditional(attestationCase: TypedEntity, input: ReasonInput): Promise<any> {
    return this.attClient.client.portal_attestation_revokeadditional_post(this.getKey(attestationCase), input);
  }

  /**
   * Zurücknehmen einer gestellten Frage
   * @param attestationCase The attestation case
   * @param input reason and/or standard reason
   */
  public async recallDecision(attestationCase: TypedEntity, input: ReasonInput): Promise<any> {
    return this.attClient.client.portal_attestation_recalldecision_post(this.getKey(attestationCase), input);
  }

  /**
   * Die Entscheidung verweigern
   * @param attestationCase The attestation case
   * @param input reason and/or standard reason
   */
  public async denyDecision(attestationCase: PortalAttestationApprove, input: DenyDecisionInput): Promise<any> {
    return this.attClient.client.portal_attestation_denydecision_post(this.getKey(attestationCase), input);
  }

  private getKey(attestationCase: TypedEntity): string {
    return attestationCase.GetEntity().GetKeys()[0];
  }

  private async getParameterCandidates(parameters: ParameterDataLoadParameters): Promise<EntityCollectionData> {
    const parameter: CollectionLoadParameters = {
      PageSize: parameters.PageSize,
      OrderBy: parameters.OrderBy,
      filter: parameters.filter,
      ParentKey: parameters.ParentKey,
      search: parameters.search,
      StartIndex: parameters.StartIndex,
      withProperties: parameters.withProperties,
    };
    return this.attClient.client.portal_attestation_approve_parameter_candidates_post(
      parameters.columnName,
      parameters.fkTableName || '',
      parameters.diffData || {},
      parameter,
    );
  }

  private async getFilterTree(parameters: ParameterDataLoadParameters): Promise<FilterTreeData> {
    const parameter: CollectionLoadParameters = {
      filter: parameters.filter,
      parentKey: parameters.ParentKey,
    };
    return this.attClient.client.portal_attestation_approve_parameter_candidates_filtertree_post(
      parameters.columnName,
      parameters.fkTableName || '',
      parameters.diffData || {},
      parameter,
    );
  }
}
