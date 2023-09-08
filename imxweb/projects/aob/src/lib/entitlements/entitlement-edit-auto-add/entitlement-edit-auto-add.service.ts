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

import { EntitlementToAddData } from 'imx-api-aob';
import { CollectionLoadParameters, EntityCollectionData, FilterProperty, InteractiveEntityStateData } from 'imx-qbm-dbts';
import { SqlWizardApiService } from 'qbm';
import { AobApiService } from '../../aob-api-client.service';

@Injectable({ providedIn: 'root' })
export class EntitlementEditAutoAddService implements SqlWizardApiService {
  constructor(private readonly api: AobApiService) { }

  public async getFilterProperties(table: string): Promise<FilterProperty[]> {
    return (await this.api.client.portal_application_sqlwizard_tables_columns_get(table)).Properties;
  }

  public async getCandidates(parentTable: string, options?: CollectionLoadParameters): Promise<EntityCollectionData> {
    return this.api.client.portal_application_sqlwizard_candidates_get(parentTable, options);
  }

  public async showEntitlementsToMap(state: InteractiveEntityStateData): Promise<EntitlementToAddData> {
    return this.api.client.portal_application_interactive_entitlementstoadd_get(
      state.EntityId, { keys: state.Keys, state: state.State });
  }

  public async mapEntitlementsToApplication(uidApplication: string): Promise<void> {
     return this.api.client.portal_application_map_post(uidApplication);
  }
}
