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

import { PortalPersonRolemembershipsAerole } from 'imx-api-qer';
import { CollectionLoadParameters, EntitySchema, ExtendedTypedEntityCollection } from 'imx-qbm-dbts';
import { QerApiService } from '../../../qer-api-client.service';

@Injectable({
  providedIn: 'root'
})
export class IdentityRoleMembershipsService {

  constructor(private readonly qerApiClient: QerApiService) { }

  public get PortalPersonRolemembershipsAerole(): EntitySchema {
    return this.qerApiClient.typedClient.PortalPersonRolemembershipsAerole.GetSchema();
  }

  public async getAeroleMemberships(uidPerson: string, parameter: CollectionLoadParameters):
    Promise<ExtendedTypedEntityCollection<PortalPersonRolemembershipsAerole, unknown>> {
    return this.qerApiClient.typedClient.PortalPersonRolemembershipsAerole.Get(uidPerson, parameter);
  }
}
