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
import { PortalRulesMitigatingcontrols } from 'imx-api-cpl';
import { ExtendedTypedEntityCollection } from 'imx-qbm-dbts';
import { ApiService } from '../../api.service';
import { RulesMitigatingControls } from './rules-mitigating-controls';

@Injectable({
  providedIn: 'root'
})
export class MitigatingControlsRulesService {

  constructor(
    private apiService: ApiService,
  ) { }

  public async getControls(uidNonCompliance: string): Promise<ExtendedTypedEntityCollection<RulesMitigatingControls, unknown>> {
    const collection = await this.apiService.typedClient.PortalRulesMitigatingcontrols.Get(uidNonCompliance);
    return {
      tableName: collection.tableName,
      totalCount: collection.totalCount,
      Data: collection.Data.map((item: PortalRulesMitigatingcontrols) => new RulesMitigatingControls(item))
    }
  }

  public createControl(uidCompliance: string): RulesMitigatingControls {
    // TODO: When API can handle permission issues uncomment. PBI: 305793
    const newMControl = this.apiService.typedClient.PortalRulesWorkingcopiesMitigatingcontrols.createEntity({
      Columns: {
        "UID_ComplianceRule": { Value: uidCompliance }
      }
    });
    return new RulesMitigatingControls(newMControl as PortalRulesMitigatingcontrols);
    // const newMControl = this.apiService.typedClient.PortalRulesMitigatingcontrols.createEntity({
    //   Columns: {
    //     "UID_ComplianceRule": { Value: uidCompliance }
    //   }
    // });
    // return new RulesMitigatingControls(newMControl);
  }

  public async postControl(uidNonCompliance: string, mControl: PortalRulesMitigatingcontrols): Promise<void> {
    // TODO: When API can handle permission issues uncomment. PBI: 305793
    await this.apiService.typedClient.PortalRulesWorkingcopiesMitigatingcontrols.Post(uidNonCompliance, mControl);
    // await this.apiService.typedClient.PortalRulesMitigatingcontrols.Post(uidNonCompliance, mControl);
  }

  public async deleteControl(mControl: PortalRulesMitigatingcontrols): Promise<void> {
    await mControl.GetEntity().MarkForDeletion();
    await mControl.GetEntity().Commit();
  }
}
