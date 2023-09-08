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

import { CollectionLoadParameters, EntitySchema, FilterData, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { OpsupportSyncJournal, OpsupportSyncShell } from 'imx-api-dpr';
import { DprApiService } from '../../../dpr-api-client.service';

export interface OpsupportSyncShellParameters extends CollectionLoadParameters {
  withfrozenjobs?: boolean;
}

export interface OpsSyncJournalParameters extends CollectionLoadParameters {
  shell?: string;
  filter?: FilterData[];
}

@Injectable()
export class SyncService {
  public get syncShellSchema(): EntitySchema {
    return this.dprClient.typedClient.OpsupportSyncShell.GetSchema();
  }

  public get syncJournalSchema(): EntitySchema {
    return this.dprClient.typedClient.OpsupportSyncJournal.GetSchema();
  }

  constructor(private readonly dprClient: DprApiService) { }

  public getSyncShell(parameters: OpsupportSyncShellParameters): Promise<TypedEntityCollectionData<OpsupportSyncShell>> {
    return this.dprClient.typedClient.OpsupportSyncShell.Get(parameters);
  }

  public getSyncJournal(parameters: OpsSyncJournalParameters): Promise<TypedEntityCollectionData<OpsupportSyncJournal>> {
    return this.dprClient.typedClient.OpsupportSyncJournal.Get(parameters);
  }

  public async GetDisplayName(uidShell: string, withfrozenjobs: boolean = false): Promise<string> {
    const syncShellItem = (await this.getSyncShell({ withfrozenjobs })).Data.find(a => a.UID_DPRShell.value === uidShell);
    return syncShellItem ? syncShellItem.DisplayName.value : null;
  }

}
