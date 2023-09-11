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

import { FilterData, DataModel } from 'imx-qbm-dbts';
import { IRoleDataModel } from 'qer';
import { RmsApiService } from './rms-api-client.service';

export class EsetDataModel implements IRoleDataModel {

  constructor(
    private readonly api: RmsApiService
  ) { }
  public async getModel(filter: FilterData[], isAdmin: boolean): Promise<DataModel> {
    return isAdmin ?
      this.api.client.portal_admin_role_eset_datamodel_get({ filter: filter })
      : this.api.client.portal_resp_eset_datamodel_get({ filter: filter });
  }
}
