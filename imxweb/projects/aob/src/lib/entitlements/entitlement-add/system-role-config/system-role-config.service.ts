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
 * Copyright 2022 One Identity LLC.
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
import { PortalEntitlementSystemrole } from 'imx-api-aob';

import { CollectionLoadParameters, EntitySchema, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { AobApiService } from '../../../aob-api-client.service';

@Injectable({
  providedIn: 'root'
})
export class SystemRoleConfigService {

  constructor(
    private readonly aobClient: AobApiService,
  ) {
  }

  public get roleSchema(): EntitySchema {
    return this.aobClient.typedClient.PortalEntitlementcandidatesEset.GetSchema();
  }

  public async getExistingRoles(application: string, parameters: CollectionLoadParameters):
    Promise<TypedEntityCollectionData<PortalEntitlementSystemrole>> {
    return this.aobClient.typedClient.PortalEntitlementSystemrole.Get(application, parameters);
  }
}
