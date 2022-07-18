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
 * Copyright 2022 One Identity LLC.
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
import { EuiLoadingService } from '@elemental-ui/core';
import { OverlayRef } from '@angular/cdk/overlay';

import { ImxDataSource, imx_SessionService } from 'qbm';
import { EntityCollectionData, EntityData, EntitySchema, ExtendedTypedEntityCollection } from 'imx-qbm-dbts';
import { OpsupportQueueTree, ReactivateJobMode } from 'imx-api-qbm';
import { QueueJobsService } from '../jobs/queue-jobs.service';

@Injectable()
export class QueueTreeService extends ImxDataSource<OpsupportQueueTree> {

  public startUid: string;

  public items: OpsupportQueueTree[];

  constructor(
    private session: imx_SessionService,
    private jobService: QueueJobsService,
    private busyService: EuiLoadingService) {
    super();
  }

  public get QueueTreeEntitySchema(): EntitySchema {
    return this.session.TypedClient.OpsupportQueueTree.GetSchema();
  }

  public itemsProvider = async () => {
    let result: ExtendedTypedEntityCollection<OpsupportQueueTree, unknown>;
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());

    try {
      result = await this.session.TypedClient.OpsupportQueueTree.Get({ uidtree: this.startUid });
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
    return this.data = this.items = result?.Data;
  }

  public childItemsProvider = (item: OpsupportQueueTree) => {

    const child1 = this.items ? this.items.find(el => el.UID_Job.value === item.UID_JobError.value) : null;
    const child2 = this.items ? this.items.find(el => el.UID_Job.value === item.UID_JobSuccess.value) : null;

    const res = [];
    if (child1) { res.push(child1); }
    if (child2) { res.push(child2); }

    return Promise.resolve(res);
  }

  public hasChildrenProvider = (data: OpsupportQueueTree) => {
    return (data.UID_JobError.value != null && data.UID_JobError.value !== '')
      || (data.UID_JobSuccess.value != null && data.UID_JobSuccess.value !== '');
  }

  public GetTotalSteps(): number {
    let count = 1;
    this.items.forEach(el => {
      if (el.UID_JobError.value !== '') {
        count++;
      }
      if (el.UID_JobSuccess.value !== '') {
        count++;
      }
    });
    return count;
  }

  public GetCompleteSteps(): number {
    const root = this.items.find(el => el.IsRootJob.value);
    return this.GetCompleteSubSteps(root.UID_Job.value);
  }

  public RemoveEmpty(ent: EntityData[]): EntityData[] {
    const ret: EntityData[] = [];
    ent.forEach(el => {
      if (el !== null) {
        ret.push(el);
      }
    });
    return ret;
  }

  public CanBeReactivated(): boolean {
    if (!this.items) { return false; }
    return this.getFrozenItem() !== undefined;
  }

  public async Reactivate(mode: ReactivateJobMode): Promise<EntityCollectionData> {
    const frozen = this.getFrozenItem();
    if (frozen) {
      return this.jobService.Retry(mode, [frozen.UID_Job.value]);
    }
    return Promise.resolve(null);
  }

  private GetCompleteSubSteps(uidJob: string): number {

    if (uidJob === '') { return 0; }
    const current = this.items.find(el => el.UID_Job.value === uidJob);

    const count = current && current.Ready2EXE.value === 'FINISHED' ? 1 : 0;

    return count + this.GetCompleteSubSteps(current.UID_JobSuccess.value) + this.GetCompleteSubSteps(current.UID_JobError.value);
  }

  public getFrozenItem(): OpsupportQueueTree {
    return this.items.find(el => el.Ready2EXE.value.toUpperCase() === 'FROZEN' ||
      el.Ready2EXE.value.toUpperCase() === 'OVERLIMIT');
  }
}
