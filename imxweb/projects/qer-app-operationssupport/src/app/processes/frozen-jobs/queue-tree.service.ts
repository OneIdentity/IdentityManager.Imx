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
 * Copyright 2024 One Identity LLC.
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

import { HistoryOperationsData, OpsupportQueueJobaffects, ReactivateJobMode } from '@imx-modules/imx-api-qbm';
import {
  EntityCollectionData,
  EntityData,
  EntitySchema,
  ExtendedTypedEntityCollection,
  IEntityColumn,
  TypedEntity,
  TypedEntityCollectionData,
} from '@imx-modules/imx-qbm-dbts';
import { CdrFactoryService, ImxDataSource, imx_SessionService } from 'qbm';
import { QueueJobsService } from '../jobs/queue-jobs.service';

@Injectable()
export class QueueTreeService extends ImxDataSource<TypedEntity> {
  public startUid: string;

  public items: TypedEntity[];
  public load: (startId: string) => Promise<TypedEntityCollectionData<TypedEntity>>;

  constructor(
    private session: imx_SessionService,
    private jobService: QueueJobsService,
  ) {
    super();
  }

  public get QueueTreeEntitySchema(): EntitySchema {
    return this.session.TypedClient.OpsupportQueueTree.GetSchema();
  }

  public itemsProvider = async () => {
    let result: ExtendedTypedEntityCollection<TypedEntity, unknown>;

    result = await this.load(this.startUid); //await this.session.TypedClient.OpsupportQueueTree.Get({ uidtree: this.startUid });

    this.items = result?.Data;
    return this.items;
  };

  public childItemsProvider = (item: TypedEntity) => {
    const child1 = this.items
      ? this.items.find((el) => this.getColumn(el, 'UID_Job')?.GetValue() === this.getColumn(item, 'UID_JobError')?.GetValue())
      : undefined;
    const child2 = this.items
      ? this.items.find((el) => this.getColumn(el, 'UID_Job')?.GetValue() === this.getColumn(item, 'UID_JobSuccess')?.GetValue())
      : undefined;

    const res: TypedEntity[] = [];
    if (child1) {
      res.push(child1);
    }
    if (child2) {
      res.push(child2);
    }

    return Promise.resolve(res);
  };

  public hasChildrenProvider = (data: TypedEntity) => {
    const error = this.getColumn(data, 'UID_JobError')?.GetValue();
    const success = this.getColumn(data, 'UID_JobSuccess')?.GetValue()
    return (
      ( error && success) ||
      ( error !== '' && success !== '')
    );
  };

  public async GetAffectedObjects(uidJob: string): Promise<OpsupportQueueJobaffects[]> {
    return (await this.session.TypedClient.OpsupportQueueJobaffects.Get(uidJob)).Data;
  }

  public GetChangeOperations(processId: string): Promise<HistoryOperationsData> {
    return this.session.Client.opsupport_changeoperations_process_get(processId);
  }

  public GetTotalSteps(): number {
    let count = 1;
    this.items.forEach((el) => {
      const error = this.getColumn(el, 'UID_JobError')?.GetValue();
      if (error && error !== '') {
        count++;
      }
      const success = this.getColumn(el, 'UID_JobSuccess')?.GetValue();
      if (success && success !== '') {
        count++;
      }
    });
    return count;
  }

  public GetCompleteSteps(): number {
    const root = this.items.find((el) => this.getColumn(el, 'IsRootJob')?.GetValue());
    return root ? this.GetCompleteSubSteps(this.getColumn(root, 'UID_Job')?.GetValue()) : 0;
  }

  public RemoveEmpty(ent: EntityData[]): EntityData[] {
    const ret: EntityData[] = [];
    ent.forEach((el) => {
      if (el !== null) {
        ret.push(el);
      }
    });
    return ret;
  }

  public CanBeReactivated(): boolean {
    if (!this.items) {
      return false;
    }
    return !!this.getFrozenItem();
  }

  public async Reactivate(mode: ReactivateJobMode): Promise<EntityCollectionData | undefined> {
    const frozen = this.getFrozenItem();
    const uidJob = frozen ? this.getColumn(frozen, 'UID_Job')?.GetValue() : undefined;
    if (frozen && uidJob) {
      return this.jobService.Retry(mode, [uidJob]);
    }
  }

  private GetCompleteSubSteps(uidJob?: string): number {
    if (!uidJob || uidJob === '') {
      return 0;
    }
    const current = this.items.find((el) => this.getColumn(el, 'UID_Job')?.GetValue() === uidJob);

    const count = current && (this.getColumn(current, 'Ready2EXE')?.GetValue() ?? 'FINISHED') === 'FINISHED' ? 1 : 0;
    return current
      ? count +
          this.GetCompleteSubSteps(this.getColumn(current, 'UID_JobSuccess')?.GetValue()) +
          this.GetCompleteSubSteps(this.getColumn(current, 'UID_JobError')?.GetValue())
      : count;
  }

  public getFrozenItem(): TypedEntity | undefined {
    return this.items.find(
      (el) =>
        this.getColumn(el, 'Ready2EXE')?.GetValue()?.toUpperCase() === 'FROZEN' ||
        this.getColumn(el, 'Ready2EXE')?.GetValue()?.toUpperCase() === 'OVERLIMIT',
    );
  }

  private getColumn(entity: TypedEntity, name: string): IEntityColumn | undefined {
    return CdrFactoryService.tryGetColumn(entity.GetEntity(), name);
  }
}
