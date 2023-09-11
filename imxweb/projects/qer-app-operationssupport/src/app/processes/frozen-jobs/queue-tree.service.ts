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

import { CdrFactoryService, ImxDataSource, imx_SessionService } from 'qbm';
import { EntityCollectionData, EntityData, EntitySchema, ExtendedTypedEntityCollection, IEntityColumn, TypedEntity, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { HistoryOperationsData, OpsupportQueueJobaffects, ReactivateJobMode } from 'imx-api-qbm';
import { QueueJobsService } from '../jobs/queue-jobs.service';

@Injectable()
export class QueueTreeService extends ImxDataSource<TypedEntity> {

  public startUid: string;

  public items: TypedEntity[];
  public load: (startId: string) => Promise<TypedEntityCollectionData<TypedEntity>>

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

    result = await this.load(this.startUid);//await this.session.TypedClient.OpsupportQueueTree.Get({ uidtree: this.startUid });
    return this.data = this.items = result?.Data;
  }

  public childItemsProvider = (item: TypedEntity) => {

    const child1 = this.items ? this.items.find(el => this.getColumn(el, 'UID_Job').GetValue() === this.getColumn(item, 'UID_JobError').GetValue()) : null;
    const child2 = this.items ? this.items.find(el => this.getColumn(el, 'UID_Job').GetValue() === this.getColumn(item, 'UID_JobSuccess').GetValue()) : null;

    const res = [];
    if (child1) { res.push(child1); }
    if (child2) { res.push(child2); }

    return Promise.resolve(res);
  }

  public hasChildrenProvider = (data: TypedEntity) => {
    return (this.getColumn(data, 'UID_JobError').GetValue() != null && this.getColumn(data, 'UID_JobError').GetValue() !== '')
      || (this.getColumn(data, 'UID_JobSuccess').GetValue() != null && this.getColumn(data, 'UID_JobSuccess').GetValue() !== '');
  }

  public async GetAffectedObjects(uidJob: string): Promise<OpsupportQueueJobaffects[]> {
    return (await this.session.TypedClient.OpsupportQueueJobaffects.Get(uidJob)).Data;
  }

  public GetChangeOperations(processId: string): Promise<HistoryOperationsData> {
    return this.session.Client.opsupport_changeoperations_process_get(processId);
  }

  public GetTotalSteps(): number {
    let count = 1;
    this.items.forEach(el => {
      if (this.getColumn(el, 'UID_JobError').GetValue() !== '') {
        count++;
      }
      if (this.getColumn(el, 'UID_JobSuccess').GetValue() !== '') {
        count++;
      }
    });
    return count;
  }

  public GetCompleteSteps(): number {
    const root = this.items.find(el => this.getColumn(el, 'IsRootJob').GetValue());
    return this.GetCompleteSubSteps(this.getColumn(root, 'UID_Job').GetValue());
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
      return this.jobService.Retry(mode, [this.getColumn(frozen, 'UID_Job').GetValue()]);
    }
    return Promise.resolve(null);
  }

  private GetCompleteSubSteps(uidJob: string): number {

    if (uidJob === '') { return 0; }
    const current = this.items.find(el => this.getColumn(el, 'UID_Job').GetValue() === uidJob);

    const count = current && (this.getColumn(current, 'Ready2EXE')?.GetValue() ?? 'FINISHED') === 'FINISHED' ? 1 : 0;

    return count + this.GetCompleteSubSteps(this.getColumn(current, 'UID_JobSuccess').GetValue()) + this.GetCompleteSubSteps(this.getColumn(current, 'UID_JobError').GetValue());
  }

  public getFrozenItem(): TypedEntity {
    return this.items.find(el => this.getColumn(el, 'Ready2EXE')?.GetValue()?.toUpperCase() === 'FROZEN' ||
      this.getColumn(el, 'Ready2EXE')?.GetValue()?.toUpperCase() === 'OVERLIMIT');
  }

  private getColumn(entity: TypedEntity, name: string): IEntityColumn {
    return CdrFactoryService.tryGetColumn(entity.GetEntity(), name);
  }
}
