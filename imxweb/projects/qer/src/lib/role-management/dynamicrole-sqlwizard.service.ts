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

import { Injectable } from "@angular/core";
import { CollectionLoadParameters, EntityCollectionData, FilterProperty } from "imx-qbm-dbts";
import { SqlWizardApiService } from "qbm";
import { QerApiService } from "../qer-api-client.service";

@Injectable()
export class DynamicRoleSqlWizardService extends SqlWizardApiService {
  constructor(private readonly api: QerApiService) {
    super();
  }

  public async getFilterProperties(table: string): Promise<FilterProperty[]> {
    return (await this.api.client.portal_dynamicgroup_sqlwizard_tables_columns_get(table)).Properties;
  }

  public async getCandidates(parentTable: string, options?: CollectionLoadParameters): Promise<EntityCollectionData> {
    return await this.api.v2Client.portal_dynamicgroup_sqlwizard_candidates_get(parentTable, options);
  }
}
