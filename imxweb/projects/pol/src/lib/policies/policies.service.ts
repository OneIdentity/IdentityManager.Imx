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

import { Injectable } from '@angular/core';
import { PolicyConfig, PortalPoliciesMitigatingcontrols, PortalPolicies } from 'imx-api-pol';
import { CollectionLoadParameters, DataModel, EntitySchema, ExtendedTypedEntityCollection } from 'imx-qbm-dbts';
import { AppConfigService } from 'qbm';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root',
})
export class PoliciesService {
  constructor(private apiservice: ApiService, private appConfig: AppConfigService) {}

  public get policySchema(): EntitySchema {
    return this.apiservice.typedClient.PortalPolicies.GetSchema();
  }

  public async featureConfig(): Promise<PolicyConfig> {
    return this.apiservice.client.portal_policy_config_get();
  }

  public async getPolicies(parameter?: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<PortalPolicies, unknown>> {
    return this.apiservice.typedClient.PortalPolicies.Get(parameter);
  }

  public async getDataModel(): Promise<DataModel> {
    return this.apiservice.client.portal_policies_datamodel_get();
  }

  public policyReport(uidpolicy: string): string {
    const path = `policies/${uidpolicy}/report`;
    return `${this.appConfig.BaseUrl}/portal/${path}`;
  }

  /**
   * Calls the api for the mitigating controls associated with a policy
   * @param uid policy uid
   * @returns a promise of the array of mitigating controls
   */
  public async getMitigatingControls(uid: string): Promise<ExtendedTypedEntityCollection<PortalPoliciesMitigatingcontrols, unknown>> {
    return this.apiservice.typedClient.PortalPoliciesMitigatingcontrols.Get(uid);
  }
}
