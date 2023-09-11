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
import { PortalApplicationIdentities, PortalApplicationIdentitiesbyidentity } from 'imx-api-aob';
import { CollectionLoadParameters, EntitySchema, ExtendedTypedEntityCollection } from 'imx-qbm-dbts';
import { AobApiService } from '../../aob-api-client.service';

@Injectable({
  providedIn: 'root'
})
export class IdentityService {

  constructor(private readonly api: AobApiService) { }

  public async get(applicationId: string, params?: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<PortalApplicationIdentities, unknown>> {
    return await this.api.typedClient.PortalApplicationIdentities.Get(applicationId, params);
  }

  public getSchema(): EntitySchema {
    return this.api.typedClient.PortalApplicationIdentities.GetSchema();
  }

  public async getByIdentity(applicationId: string, identityId: string, params?: CollectionLoadParameters): Promise<ExtendedTypedEntityCollection<PortalApplicationIdentitiesbyidentity, unknown>> {
    return await this.api.typedClient.PortalApplicationIdentitiesbyidentity.Getbyidentity(applicationId, identityId, params);
  }

  public getByIdentitySchema(): EntitySchema {
    return this.api.typedClient.PortalApplicationIdentitiesbyidentity.GetSchema();
  }

}
