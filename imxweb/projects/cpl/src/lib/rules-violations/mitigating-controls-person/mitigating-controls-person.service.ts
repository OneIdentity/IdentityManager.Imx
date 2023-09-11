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

import { DeferredOperationData, PortalPersonMitigatingcontrols } from 'imx-api-cpl';
import { CollectionLoadParameters, EntityKeysData, EntitySchema, ExtendedTypedEntityCollection } from 'imx-qbm-dbts';
import { ApiService } from '../../api.service';
import { PersonMitigatingControls } from './person-mitigating-controls';

@Injectable({
  providedIn: 'root',
})
export class MitigatingControlsPersonService {
  constructor(private apiService: ApiService) {}

  public get mitigationSchema(): EntitySchema {
    return this.apiService.typedClient.PortalPersonMitigatingcontrols.GetSchema();
  }

  public async getControls(
    uidPerson: string,
    uidNonCompliance: string
  ): Promise<ExtendedTypedEntityCollection<PortalPersonMitigatingcontrols, DeferredOperationData>> {
    return this.apiService.typedClient.PortalPersonMitigatingcontrols.Get(uidPerson, uidNonCompliance);
  }

  public createControl(uidPerson: string, uidNonCompliance: string): PersonMitigatingControls {
    const newMControl = this.apiService.typedClient.PortalPersonMitigatingcontrols.createEntity({
      Columns: {
        UID_NonCompliance: { Value: uidNonCompliance },
        UID_Person: { Value: uidPerson },
        IsInActive: { Value: false },
      },
    });
    return new PersonMitigatingControls(true, newMControl);
  }

  public async postControl(uidPerson: string, uidNonCompliance: string, mControl: PortalPersonMitigatingcontrols): Promise<void> {
    await this.apiService.typedClient.PortalPersonMitigatingcontrols.Post(uidPerson, uidNonCompliance, mControl);
  }

  public async postControlRequest(
    uidPerson: string,
    uidNonCompliance: string,
    uidPersonWantsOrg: string,
    uidMitigatinControl: string
  ): Promise<void> {
    const inter = (await this.apiService.typedClient.PortalPersonMitigatingcontrolsInteractive.Get(uidPerson, uidNonCompliance)).Data[0];
    await inter.UID_PersonWantsOrg.Column.PutValue(uidPersonWantsOrg);
    await inter.UID_MitigatingControl.Column.PutValue(uidMitigatinControl);
    await this.apiService.client.portal_person_mitigatingcontrols_interactive_forrequest_get(
      uidPerson,
      uidNonCompliance,
      inter.InteractiveEntityStateData.EntityId,
      { keys: inter.InteractiveEntityStateData.Keys, state: inter.InteractiveEntityStateData.State }
    );
  }

  public async deleteControl(mControl: PersonMitigatingControls): Promise<void> {
      await mControl.GetEntity().MarkForDeletion();
      await mControl.GetEntity().Commit();
  }

  public async getCandidates(uid: string, uidNonCompliance: string, data: EntityKeysData, parameter?: CollectionLoadParameters) {
    return this.apiService.client.portal_person_mitigatingcontrols_UID_MitigatingControl_candidates_post(
      uid,
      uidNonCompliance,
      data,
      parameter
    );
  }
}
