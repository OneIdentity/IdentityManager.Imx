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
import {
  CollectionLoadParameters,
  CompareOperator,
  DataModel,
  EntityCollectionData,
  EntitySchema,
  ExtendedEntityCollectionData,
  ExtendedTypedEntityCollection,
  FilterType,
  GroupInfo,
  MethodDefinition,
} from 'imx-qbm-dbts';
import {
  PortalAttestationPolicygroups,
  PolicyFilter
} from 'imx-api-att';
import { ApiService } from '../api.service';
import { EuiLoadingService } from '@elemental-ui/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService, ClassloggerService } from 'qbm';

@Injectable({
  providedIn: 'root'
})
export class PolicyGroupService {
  private busyIndicator: OverlayRef;
  constructor(
    private api: ApiService,
    private busyService: EuiLoadingService, 
    private readonly translator: TranslateService,
    private readonly config: AppConfigService,
    private readonly logger: ClassloggerService
  ) { }

  public get AttestationPolicyGroupSchema(): EntitySchema {
    return this.api.typedClient.PortalAttestationPolicygroups.GetSchema();
  }


  public async get(parameters: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<PortalAttestationPolicygroups, unknown>> {
    return this.api.typedClient.PortalAttestationPolicygroups.Get(parameters);
  }


  public async deleteAttestationPolicyGroup(uidAttestationpolicygroup: string): Promise<EntityCollectionData> {    
    return this.api.client.portal_attestation_policygroups_delete(uidAttestationpolicygroup);
  }

  public async getPolicyGroupEdit(uid: string):
  Promise<ExtendedTypedEntityCollection<PortalAttestationPolicygroups, {}>> {
    return this.api.typedClient.PortalAttestationPolicygroupsInteractive.Get_byid(uid);
  }

  public async buildNewEntity(reference?: PortalAttestationPolicygroups, filter?: PolicyFilter):
  Promise<PortalAttestationPolicygroups> {
  const entities = await this.api.typedClient.PortalAttestationPolicygroupsInteractive.Get();
  if (reference == null) {
    return entities.Data[0];
  }
  await this.copyPropertiesFrom(entities.Data[0], reference, filter);
  return entities.Data[0];
}

public async copyPropertiesFrom(
  entity: PortalAttestationPolicygroups,
  reference: PortalAttestationPolicygroups, filter: PolicyFilter): Promise<void> {

  for (const key in this.api.typedClient.PortalAttestationPolicyEditInteractive.GetSchema().Columns) {
    if (!key.startsWith('__') && entity[key].GetMetadata().CanEdit()) {
      await entity[key].Column.PutValueStruct({
        DataValue: reference[key].value,
        DisplayValue: reference[key].Column.GetDisplayValue()
      });
    }
  }

  entity.Ident_AttestationPolicyGroup.value =
    `${reference.Ident_AttestationPolicyGroup.value} (${(await this.translator.get('#LDS#New').toPromise())})`;

  this.logger.trace(this, 'properties copied from policy', reference, filter);
}

public async getPolicyGroups(parameters: CollectionLoadParameters):
Promise<ExtendedTypedEntityCollection<PortalAttestationPolicygroups, {}>> {
const collection = await this.api.typedClient.PortalAttestationPolicygroups.Get(parameters);
return {
  tableName: collection.tableName,
  totalCount: collection.totalCount,
  Data: collection.Data.map((element, index) =>
    new PortalAttestationPolicygroups(element.GetEntity())
  )
};
}
  public handleOpenLoader(): void {
    if (!this.busyIndicator) {
      setTimeout(() => this.busyIndicator = this.busyService.show());
    }
  }

  public handleCloseLoader(): void {
    if (this.busyIndicator) {
      setTimeout(() => {
        this.busyService.hide(this.busyIndicator);
        this.busyIndicator = undefined;
      });
    }
  }
}
