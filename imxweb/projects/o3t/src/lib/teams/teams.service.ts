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
import { ApiService } from '../api.service';
import { PortalTargetsystemTeams, PortalTargetsystemTeamsChannels } from 'imx-api-o3t';
import { CollectionLoadParameters, EntitySchema, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { OverlayRef } from '@angular/cdk/overlay';
import { EuiLoadingService } from '@elemental-ui/core';

@Injectable({
  providedIn: 'root',
})
export class TeamsService {
  private busyIndicator: OverlayRef;

  constructor(private readonly o3tApiClient: ApiService, private readonly busyService: EuiLoadingService) {}

  public get teamsSchema(): EntitySchema {
    return this.o3tApiClient.typedClient.PortalTargetsystemTeams.GetSchema();
  }

  public get teamChannelsSchema(): EntitySchema {
    return this.o3tApiClient.typedClient.PortalTargetsystemTeamsChannels.GetSchema();
  }

  public async getTeams(navigationState: CollectionLoadParameters): Promise<TypedEntityCollectionData<PortalTargetsystemTeams>> {
    return this.o3tApiClient.typedClient.PortalTargetsystemTeams.Get(navigationState);
  }

  public async getTeamChannels(
    uidO3tTeam: string,
    navigationState: CollectionLoadParameters
  ): Promise<TypedEntityCollectionData<PortalTargetsystemTeamsChannels>> {
    return this.o3tApiClient.typedClient.PortalTargetsystemTeamsChannels.Get(uidO3tTeam, navigationState);
  }

  public handleOpenLoader(): void {
    if (!this.busyIndicator) {
      this.busyIndicator = this.busyService.show();
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
