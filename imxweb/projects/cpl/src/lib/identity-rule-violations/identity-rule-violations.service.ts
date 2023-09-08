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
import { ComplianceFeatureConfig, PortalPersonMitigatingcontrols, PortalPersonRolemembershipsNoncompliance, PortalRulesMitigatingcontrols } from 'imx-api-cpl';
import { CollectionLoadParameters, EntitySchema, ExtendedTypedEntityCollection } from 'imx-qbm-dbts';

import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class IdentityRuleViolationService {


  constructor(private readonly api: ApiService) {
  }

  public get nonComplianceSchema(): EntitySchema {
    return this.api.typedClient.PortalPersonRolemembershipsNoncompliance.GetSchema();
  }

  public get portalPersonMitigatingcontrols(): EntitySchema {
    return this.api.typedClient.PortalPersonMitigatingcontrols.GetSchema();
  }

  public get portalRulesMitigatingcontrols(): EntitySchema {
    return this.api.typedClient.PortalRulesMitigatingcontrols.GetSchema();
  }

  public async getNonCompliance(uidPerson: string, parameter: CollectionLoadParameters)
    : Promise<ExtendedTypedEntityCollection<PortalPersonRolemembershipsNoncompliance, unknown>> {
    return this.api.typedClient.PortalPersonRolemembershipsNoncompliance.Get(uidPerson, parameter);
  }

  public async featureConfig(): Promise<ComplianceFeatureConfig> {
    return this.api.client.portal_compliance_config_get();
  }

  public async getPersonMitigatingcontrols(uidComplianceRule: string, uidPerson: string, param: CollectionLoadParameters)
    : Promise<ExtendedTypedEntityCollection<PortalPersonMitigatingcontrols, unknown>> {
    return this.api.typedClient.PortalPersonMitigatingcontrols.Get(uidPerson, uidComplianceRule, param);
  }

  public async getRulesMitigatingcontrols(uidComplianceRule: string, param: CollectionLoadParameters)
    : Promise<ExtendedTypedEntityCollection<PortalRulesMitigatingcontrols, unknown>> {
    return this.api.typedClient.PortalRulesMitigatingcontrols.Get(uidComplianceRule, param);
  }
}
