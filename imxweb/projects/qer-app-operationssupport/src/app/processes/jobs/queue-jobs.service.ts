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

import { EntityCollectionData, EntitySchema, TypedEntityCollectionData, FilterData, CollectionLoadParameters, DataModel, TypedEntity } from 'imx-qbm-dbts';
import { DataSourceToolbarFilter, imx_SessionService } from 'qbm';
import { OpsupportQueueJobs, ReactivateJobMode } from 'imx-api-qbm';

export interface OpsupportQueueJobsParameters extends CollectionLoadParameters {
  frozen?: boolean;
  dprshell?: string;
  filter?: FilterData[];
}

@Injectable()
export class QueueJobsService {
  public get EntitySchema(): EntitySchema {
    return this.session.TypedClient.OpsupportQueueJobs.GetSchema();
  }

  constructor(private session: imx_SessionService) { }

  public Get(parameters: OpsupportQueueJobsParameters): Promise<TypedEntityCollectionData<OpsupportQueueJobs>> {
    return this.session.TypedClient.OpsupportQueueJobs.Get(parameters);
  }

  public async getFilters(): Promise<DataSourceToolbarFilter[]> {
    return (await this.getDataModel()).Filters;
  }

  public async getDataModel(): Promise<DataModel> {
    return this.session.Client.opsupport_queue_jobs_datamodel_get(undefined);
  }

  public Post(jobs: string[]): Promise<EntityCollectionData> {
    return this.Retry(ReactivateJobMode.Reactivate, jobs);
  }

  public Retry(mode: ReactivateJobMode, jobs: string[]): Promise<EntityCollectionData> {
    return this.session.Client.opsupport_queue_reactivatejob_post({ Mode: mode, UidJobs: jobs });
  }

  
  public getTreeData(startUid: string): Promise<TypedEntityCollectionData<TypedEntity>>{
    return this.session.TypedClient.OpsupportQueueTree.Get({ uidtree: startUid });
  }
}
