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

import { CollectionLoadParameters, EntitySchema, ExtendedTypedEntityCollection } from 'imx-qbm-dbts';
import { imx_SessionService } from 'qbm';
import { OpsupportJobservers } from 'imx-api-qbm';

export interface JobServersParameters extends CollectionLoadParameters {
  withconnection?: boolean;
  nofetchjob?: boolean;
}

@Injectable()
export class JobServersService {

  public get OpsupportJobserversSchema(): EntitySchema {
    return this.session.TypedClient.OpsupportJobservers.GetSchema();
  }

  constructor(private readonly session: imx_SessionService) {
  }

  public async get(parameters?: JobServersParameters): Promise<ExtendedTypedEntityCollection<OpsupportJobservers, unknown>> {
    return this.session.TypedClient.OpsupportJobservers.Get(parameters);
  }

  public async checkServerConnection(uid){
    return this.session.Client.opsupport_jobservers_check_post(uid);
  }

  public async getProjectConfig(){
    return this.session.Client.opsupport_projectconfig_get();
  }

}
