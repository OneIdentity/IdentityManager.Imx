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
 * Copyright 2021 One Identity LLC.
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
  CollectionLoadParameters,
  EntityCollectionData,
  GroupInfo,
  DataModel,
  MethodDefinition,
  TypedEntity,
  TypedEntityBuilder,
  TypedEntityCollectionData,
  EntitySchema,
  IReadValue,
  FilterTreeData
} from 'imx-qbm-dbts';
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
  ReasonInput
} from 'imx-api-att';
import { ApiService } from '../api.service';
import { AttestationCase } from './attestation-case';
import { ParameterDataService, ParameterDataLoadParameters, ApproverContainer } from 'qer';
import { AppConfigService, ElementalUiConfigService } from 'qbm';
import { AttestationDecisionLoadParameters } from './attestation-decision-load-parameters';
import { Approvers } from './approvers.interface';
import { AttestationCaseLoadParameters } from '../attestation-history/attestation-case-load-parameters.interface';

@Injectable({
  providedIn: 'root'
})
export class AttestationCasesService {
  public isChiefApproval: boolean;
  private readonly historyBuilder = new TypedEntityBuilder(PortalAttestationCaseHistory);
  private readonly apiClientMethodFactory = new ApiClientMethodFactory();

  constructor(
    private readonly attClient: ApiService,
    private readonly parameterDataService: ParameterDataService,
    private readonly elementalUiConfigService: ElementalUiConfigService,
    private readonly config: AppConfigService
  ) { }


  public get attestationApproveSchema(): EntitySchema {
    return this.attClient.typedClient.PortalAttestationApprove.GetSchema();
  }

  public get attestationCaseSchema(): EntitySchema {
    return this.attClient.typedClient.PortalAttestationCase.GetSchema();
  }

  public async get(attDecisionParameters?: AttestationDecisionLoadParameters): Promise<TypedEntityCollectionData<AttestationCase>> {
    const collection = await this.attClient.typedClient.PortalAttestationApprove.Get(attDecisionParameters);
    return {
      tableName: collection.tableName,
      totalCount: collection.totalCount,
      Data: collection.Data.map((item: PortalAttestationApprove, index: number) => {
        const parameterDataContainer = this.parameterDataService.createContainer(
          item.GetEntity(),
          { ...collection.extendedData, ...{ index } },
          parameters => this.getParameterCandidates(parameters),
          treefilterparameter => this.getFilterTree(treefilterparameter)
        );

        return new AttestationCase(item, this.isChiefApproval, parameterDataContainer, { ...collection.extendedData, ...{ index } });
      })
    };
  }

  public async getNumberOfPending(parameters: AttestationCaseLoadParameters): Promise<number> {
    const pendingAttestations = await this.attClient.typedClient.PortalAttestationApprove.Get({
      ...parameters,
      ...{ PageSize: -1 }
    });

    return pendingAttestations?.totalCount ?? 0;
  }

  public async getDataModel(): Promise<DataModel> {
    return this.attClient.client.portal_attestation_approve_datamodel_get(this.isChiefApproval, undefined, undefined);
  }

  public async getGroupInfo(parameters: { by?: string, def?: string } & CollectionLoadParameters = {}): Promise<GroupInfo[]> {
    return this.attClient.client.portal_attestation_approve_group_get(
      parameters.by,
      parameters.def,
      undefined, // filter
      parameters.StartIndex,
      parameters.PageSize,
      true, // withcount
      undefined, // attestationtype
      undefined, // uidpolicy
      undefined, // type
      undefined, // risk
      this.isChiefApproval
    );
  }

  public async getApprovers(
    attestationCase: TypedEntity & {
      DecisionLevel: IReadValue<number>;
      UID_QERWorkingMethod: IReadValue<string>;
      data: AttestationCaseData;
    }
  ): Promise<Approvers> {

    const approverContainer = new ApproverContainer(
      {
        decisionLevel: attestationCase.DecisionLevel.value,
        qerWorkingMethod: attestationCase.UID_QERWorkingMethod.value,
        pwoData: attestationCase.data,
        approvers: (await this.attClient.client.portal_attestation_persondecision_get(this.getKey(attestationCase)))
          .Entities.map(item => item.Columns.UID_Person.Value)
      }
    );

    return {
      current: approverContainer.approverNow,
      future: approverContainer.approverFuture
    };
  }

  public createHistoryTypedEntities(data: AttestationCaseData): TypedEntityCollectionData<PortalAttestationCaseHistory> {
    return this.historyBuilder.buildReadWriteEntities(
      data.WorkflowHistory,
      this.attClient.typedClient.PortalAttestationCaseHistory.GetSchema()
    );
  }

  public async getLossPreviewEntities(attestationCase: AttestationCase): Promise<EntitlementLossDto[]> {
    const key = this.getKey(attestationCase);
    return this.attClient.client.portal_attestation_approve_losspreview_get(key);
  }

  public getReportDownloadOptions(attestationCase: TypedEntity): EuiDownloadOptions {
    const key = this.getKey(attestationCase);
    return {
      ... this.elementalUiConfigService.Config.downloadOptions,
      url: this.config.BaseUrl + new MethodDefinition(this.apiClientMethodFactory.portal_attestation_report_get(key)).path,
      fileName: `${key}.pdf`
    };
  }

  /**
   * Approve or deny the attestation case
   * @param attestationCase The attestation case
   * @param input reason and/or standard reason
   */
  public async makeDecision(attestationCase: PortalAttestationApprove, input: DecisionInput): Promise<any> {
    return this.attClient.client.portal_attestation_decide_post(
      this.getKey(attestationCase),
      input
    );
  }

  /**
   * Entscheidungsworkflow auf einen bestimmten Schritt setzen
   * @param attestationCase The attestation case
   * @param input reason and/or standard reason
   */
  public async directDecision(attestationCase: PortalAttestationApprove, input: DirectDecisionInput): Promise<any> {
    return this.attClient.client.portal_attestation_directdecision_post(
      this.getKey(attestationCase),
      input
    );
  }

  public async escalateDecision(attestationCase: PortalAttestationApprove, input: ReasonInput): Promise<any> {
    return this.attClient.client.portal_attestation_escalate_post(
      this.getKey(attestationCase),
      input
    );
  }

  /**
   * Eine andere Person zusätzlich zur mir zur Entscheidung berechtigen
   * @param attestationCase The attestation case
   * @param input reason and/or standard reason
   */
  public async addAdditional(attestationCase: PortalAttestationApprove, input: OtherApproverInput): Promise<any> {
    return this.attClient.client.portal_attestation_additional_post(
      this.getKey(attestationCase),
      input
    );
  }

  /**
   * Eine andere Person an meiner Stelle (ersetzend) zur Entscheidung berechtigen
   * @param attestationCase The attestation case
   * @param input reason and/or standard reason
   */
  public async addInsteadOf(attestationCase: PortalAttestationApprove, input: OtherApproverInput): Promise<any> {
    return this.attClient.client.portal_attestation_insteadof_post(
      this.getKey(attestationCase),
      input
    );
  }

  /**
   * Zurücknehmen von AddAdditional oder AddInsteadOf
   * @param attestationCase The attestation case
   * @param input reason and/or standard reason
   */
  public async revokeDelegation(attestationCase: TypedEntity, input: ReasonInput): Promise<any> {
    return this.attClient.client.portal_attestation_revokedelegation_post(
      this.getKey(attestationCase),
      input
    );
  }

  /**
   * Zurücknehmen einer gestellten Frage
   * @param attestationCase The attestation case
   * @param input reason and/or standard reason
   */
  public async recallDecision(attestationCase: TypedEntity, input: ReasonInput): Promise<any> {
    return this.attClient.client.portal_attestation_recalldecision_post(
      this.getKey(attestationCase),
      input
    );
  }

  /**
   * Die Entscheidung verweigern
   * @param attestationCase The attestation case
   * @param input reason and/or standard reason
   */
  public async denyDecision(attestationCase: PortalAttestationApprove, input: DenyDecisionInput): Promise<any> {
    return this.attClient.client.portal_attestation_denydecision_post(
      this.getKey(attestationCase),
      input
    );
  }

  private getKey(attestationCase: TypedEntity): string {
    return attestationCase.GetEntity().GetKeys()[0];
  }

  private async getParameterCandidates(parameters: ParameterDataLoadParameters): Promise<EntityCollectionData> {
    return this.attClient.client.portal_attestation_approve_parameter_candidates_post(
      parameters.columnName,
      parameters.fkTableName,
      parameters.OrderBy,
      parameters.StartIndex,
      parameters.PageSize,
      parameters.filter,
      null,
      parameters.search,
      parameters.ParentKey,
      parameters.diffData
    );
  }

  private async getFilterTree(parameters: ParameterDataLoadParameters): Promise<FilterTreeData>
  {
    return this.attClient.client.portal_attestation_approve_parameter_candidates_filtertree_post(
      parameters.columnName,
      parameters.fkTableName,
      parameters.filter,
      parameters.ParentKey,
      parameters.diffData
    );
  }
}
