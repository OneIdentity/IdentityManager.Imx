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

import { OpsupportSyncJournal, OpsupportSyncShell } from '@imx-modules/imx-api-dpr';
import {
  OpsupportQueueFrozenjobs,
  OpsupportQueueJobchains,
  OpsupportQueueJobperformance,
  OpsupportQueueJobs,
} from '@imx-modules/imx-api-qbm';
import { EntityData, IEntity, IEntityColumn } from '@imx-modules/imx-qbm-dbts';
import { BaseImxApiDataMock, BaseImxApiDtoMock, CreateIEntity, CreateIEntityColumn, CreateIReadValue } from 'qbm';

export interface JobChainsMock {
  JobChainName: string;
  Count: number;
}

export interface IJobQueueParams {
  TaskName?: string;
  JobChainName?: string;
  Uid_Tree?: string;
  Uid_Job?: string;
  Uid_JobSuccess?: string;
  Uid_JobError?: string;
  ErrorMessages?: string;
  Queue?: string;
  Retries?: number;
  ReadyToExe?: string;
  IsRootJob?: boolean;
  XDateInserted?: Date;
  CombinedStatus?: string;
}

export interface IFrozenJobsParams {
  ErrorMessage?: string;
  JobChainName?: string;
  TaskName?: string;
  UID_Tree?: string;
  UID_Job?: string;
  Ready2Exe?: string;
}

export interface IOpsupportSyncShell {
  UID_DPRShell?: string;
  DisplayName?: string;
  Description?: string;
  NextSyncDate?: Date;
  CountJournalFailure?: number;
  LastSyncCountObjects?: number;
}

export interface OpsupportQueueTreeParams {
  UID_Job?: string;
  BasisObjectKey?: string;
  DeferOnError?: boolean;
  ErrorMessages?: string;
  GenProcID?: string;
  IsRootJob?: boolean;
  JobChainName?: string;
  LimitationCount?: number;
  Queue?: string;
  Ready2EXE?: string;
  TaskName?: string;
  UID_JobError?: string;
  UID_JobOrigin?: string;
  UID_JobSameServer?: string;
  UID_JobSuccess?: string;
  UID_Tree?: string;
  XDateInserted?: Date;
  XDateUpdated?: Date;
  XUserInserted?: string;
  XUserUpdated?: string;
}

export interface OpsupportSyncJournalMock {
  UID_DPRJournal: string;
  CreationTime?: Date;
  UID_DPRProjectionConfig?: string;
  ProjectionConfigDisplay?: string;
  ProjectionState?: string;
  ProjectionStartInfoDisplay?: string;
}

export class ImxApiDtoMock extends BaseImxApiDtoMock {
  public static CreateOpsupportJobChainsCollection(propertiesCollection: JobChainsMock[]): OpsupportQueueJobchains[] {
    return propertiesCollection.map((properties) => this.CreateOpsupportJobChains(properties));
  }

  public static CreateOpsupportJobChains(properties: JobChainsMock): OpsupportQueueJobchains {
    const jobChainName = CreateIEntityColumn(properties.JobChainName);
    const count = CreateIEntityColumn(properties.Count.toString());

    return {
      JobChainName: CreateIReadValue(properties.JobChainName, jobChainName),
      Count: CreateIReadValue(properties.Count, count),
      GetEntity: () =>
        CreateIEntity((name: string) => {
          if (name === 'JobChainName') {
            return jobChainName;
          }

          return count;
        }),
    } as OpsupportQueueJobchains;
  }

  public static CreateOpsupportSyncJournalCollection(propertiesCollection: OpsupportSyncJournalMock[]): OpsupportSyncJournal[] {
    return propertiesCollection.map(
      (properties) =>
        ({
          CreationTime: CreateIReadValue(properties.CreationTime, CreateIEntityColumn(properties.CreationTime.toLocaleString())),
          ProjectionConfigDisplay: CreateIReadValue(properties.ProjectionConfigDisplay),
          ProjectionStartInfoDisplay: CreateIReadValue(properties.ProjectionStartInfoDisplay),
          ProjectionState: CreateIReadValue(properties.ProjectionState),
          UID_DPRJournal: CreateIReadValue(properties.UID_DPRJournal),
          UID_DPRProjectionConfig: CreateIReadValue(properties.UID_DPRProjectionConfig),
        }) as OpsupportSyncJournal,
    );
  }

  public static CreateSingleOpsupportQueueTreeBranch(properties: OpsupportQueueTreeParams): IEntity {
    const columns = {};
    for (var prop in properties) {
      if (Object.prototype.hasOwnProperty.call(properties, prop)) {
        columns[prop] = this.createColumn(properties[prop]);
      }
    }
    return this.createEntity(columns);
  }

  public static createColumn(value?) {
    return {
      GetMetadata: () => ({ CanEdit: () => true }),
      GetValue: () => value,
      GetDisplayValue: () => '',
    } as IEntityColumn;
  }

  public static createEntity(columns: { [name: string]: IEntityColumn } = {}, key?) {
    return {
      GetDisplay: () => '',
      GetColumn: (name) => columns[name] || this.createColumn(),
      GetKeys: () => [key],
    } as IEntity;
  }

  public static CreateOpsupportQueueTree(propertiesCollection: OpsupportQueueTreeParams[]): IEntity[] {
    return propertiesCollection.map((properties) => {
      return this.CreateSingleOpsupportQueueTreeBranch(properties);
    });
  }

  public static CreateOpsupportQueueFrozenjobsCollection(propertiesCollection: IJobQueueParams[]): OpsupportQueueFrozenjobs[] {
    return propertiesCollection.map((properties) => this.CreateOpsupportQueueFrozenjobs(properties));
  }

  public static CreateOpsupportQueueFrozenjobs(properties: IJobQueueParams): OpsupportQueueFrozenjobs {
    return {
      TaskName: CreateIReadValue(properties.TaskName, CreateIEntityColumn(properties.TaskName)),
      JobChainName: CreateIReadValue(properties.JobChainName, CreateIEntityColumn(properties.JobChainName)),
      UID_Tree: CreateIReadValue(properties.Uid_Tree),
      UID_Job: CreateIReadValue(properties.Uid_Job),
      UID_JobSuccess: CreateIReadValue(properties.Uid_JobSuccess),
      UID_JobError: CreateIReadValue(properties.Uid_JobError),
      ErrorMessages: CreateIReadValue(properties.ErrorMessages ? properties.ErrorMessages : ''),
      Retries: CreateIReadValue(properties.Retries),
      Queue: CreateIReadValue(properties.Queue),
      Ready2EXE: CreateIReadValue(properties.ReadyToExe),
      IsRootJob: CreateIReadValue(properties.IsRootJob),
      XDateInserted: CreateIReadValue(properties.XDateInserted),
    } as OpsupportQueueFrozenjobs;
  }

  public static CreateOpsupportSyncShellCollection(propertiesCollection: IOpsupportSyncShell[]): OpsupportSyncShell[] {
    return propertiesCollection.map(
      (properties) =>
        ({
          CountJournalFailure: CreateIReadValue(
            properties.CountJournalFailure,
            CreateIEntityColumn(properties.CountJournalFailure.toString()),
          ),
          Description: CreateIReadValue(properties.Description, CreateIEntityColumn(properties.Description)),
          DisplayName: CreateIReadValue(properties.DisplayName, CreateIEntityColumn(properties.DisplayName)),
          LastSyncCountObjects: CreateIReadValue(
            properties.LastSyncCountObjects,
            CreateIEntityColumn(properties.LastSyncCountObjects.toString()),
          ),
          NextSyncDate: CreateIReadValue(properties.NextSyncDate, CreateIEntityColumn(properties.NextSyncDate.toLocaleString())),
          UID_DPRShell: CreateIReadValue(properties.UID_DPRShell, CreateIEntityColumn(properties.UID_DPRShell)),
        }) as OpsupportSyncShell,
    );
  }

  public static CreateOpsupportQueueJobsCollection(propertiesCollection: IJobQueueParams[]): OpsupportQueueJobs[] {
    return propertiesCollection.map(
      (properties) =>
        ({
          TaskName: CreateIReadValue(properties.TaskName),
          JobChainName: CreateIReadValue(properties.JobChainName),
          UID_Tree: CreateIReadValue(properties.Uid_Tree),
          UID_Job: CreateIReadValue(properties.Uid_Job),
          UID_JobSuccess: CreateIReadValue(properties.Uid_JobSuccess),
          UID_JobError: CreateIReadValue(properties.Uid_JobError),
          Queue: CreateIReadValue(properties.Queue),
          Retries: CreateIReadValue(properties.Retries),
          Ready2EXE: CreateIReadValue(properties.ReadyToExe),
          IsRootJob: CreateIReadValue(properties.IsRootJob),
          XDateInserted: CreateIReadValue(properties.XDateInserted),
          CombinedStatus: CreateIReadValue(properties.CombinedStatus),
        }) as OpsupportQueueJobs,
    );
  }

  public static CreateOpsupportQueueJobperformanceCollection(propertiesCollection: IJobQueueParams[]): OpsupportQueueJobperformance[] {
    return propertiesCollection.map(
      (properties) =>
        ({
          TaskName: CreateIReadValue(properties.TaskName),
          Queue: CreateIReadValue(properties.Queue),
          ComponentClass: CreateIReadValue('componentClassDummy'),
          CountPerMinute: CreateIReadValue(23),
        }) as OpsupportQueueJobperformance,
    );
  }
}

export class ImxApiDataMock extends BaseImxApiDataMock {
  public static CreateFrozenjobs(numOfEntries = 10) {
    return ImxApiDtoMock.CreateOpsupportQueueFrozenjobsCollection(
      BaseImxApiDataMock.CreateEntityDataCollection<IJobQueueParams>(
        (i) => ({
          ReadyToExe: '',
          TaskName: `TaskName${i}`,
          JobChainName: `JobChainName${i}`,
        }),
        numOfEntries,
      ),
    );
  }

  public static CreateDbQueue(numOfEntries = 10) {
    return ImxApiDataMock.CreateEntityDataCollection<EntityData>(
      (i) => ({
        Display: `display${i}`,
        LongDisplay: `longdisplay${i}`,
        Columns: {
          Object: {
            Value: `object${i}`,
          },
          SubObject: {
            Value: `subObject${i}`,
          },
          SortOrder: {
            Value: `sortOrder${i}`,
          },
        },
      }),
      numOfEntries,
    );
  }

  public static CreateJobQueue(numOfEntries = 10) {
    return ImxApiDataMock.CreateEntityDataCollection<EntityData>(
      (i) => ({
        Display: `display${i}`,
        LongDisplay: `longdisplay${i}`,
        Columns: {
          Queue: {
            Value: `queue${i}`,
          },
          TaskName: {
            Value: `taskName${i}`,
          },
          ErrorMessages: {
            Value: `errorMessages${i}`,
          },
          Ready2EXE: {
            Value: `ready2EXE${i}`,
          },
        },
      }),
      numOfEntries,
    );
  }
}

export class DummyJobData {
  static getItem(params: IJobQueueParams): OpsupportQueueJobs {
    const dummyTaskName = { value: params.TaskName ? params.TaskName : '' };
    const dummyJobChainName = { value: params.JobChainName ? params.JobChainName : '' };
    const dummyUidTree = { value: params.Uid_Tree };
    const dummyUidJob = { value: params.Uid_Job };
    const dummyUidJobSuccess = { value: params.Uid_JobSuccess ? params.Uid_JobSuccess : '' };
    const dummyUidJobError = { value: params.Uid_JobError ? params.Uid_JobError : '' };
    const dummyQueue = { value: params.Queue ? params.Queue : '' };
    const dummyRetries = { value: params.Retries ? params.Retries : 0 };
    const dummyIsRootJob = { value: params.IsRootJob ? params.IsRootJob : false };
    const dummyXDataInserted = { value: params.XDateInserted ? params.XDateInserted : new Date(2001, 1, 1) };
    const dummyReadyToExe = { value: params.ReadyToExe ? params.ReadyToExe : 'TRUE' };

    return {
      TaskName: dummyTaskName,
      JobChainName: dummyJobChainName,
      UID_Tree: dummyUidTree,
      UID_Job: dummyUidJob,
      UID_JobSuccess: dummyUidJobSuccess,
      UID_JobError: dummyUidJobError,
      Queue: dummyQueue,
      Retries: dummyRetries,
      IsRootJob: dummyIsRootJob,
      XDateInserted: dummyXDataInserted,
      Ready2EXE: dummyReadyToExe,
      CombinedStatus: CreateIReadValue(params.CombinedStatus),
    } as OpsupportQueueJobs;
  }
}
