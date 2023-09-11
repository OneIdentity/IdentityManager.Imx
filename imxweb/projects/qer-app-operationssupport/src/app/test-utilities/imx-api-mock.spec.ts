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

import * as TypeMoq from 'typemoq';

import { EntityData, IEntity, IEntityColumn, IReadValue, TypedEntity } from 'imx-qbm-dbts';
import { OpsupportSyncJournal, OpsupportSyncShell } from 'imx-api-dpr';
import {
  OpsupportQueueJobchains,
  OpsupportQueueTree,
  OpsupportQueueFrozenjobs,
  OpsupportQueueJobs,
  OpsupportQueueJobperformance,
} from 'imx-api-qbm';
import { BaseImxApiDtoMock, BaseImxApiDataMock, CreateIEntityColumn, CreateIReadValue, CreateIEntity } from 'qbm';

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

    const mock = TypeMoq.Mock.ofType<OpsupportQueueJobchains>();
    mock.setup((property) => property.JobChainName).returns(() => CreateIReadValue(properties.JobChainName, jobChainName));
    mock.setup((property) => property.Count).returns(() => CreateIReadValue(properties.Count, count));

    mock
      .setup((property) => property.GetEntity())
      .returns(() =>
        CreateIEntity((name: string) => {
          if (name === 'JobChainName') {
            return jobChainName;
          }

          return count;
        })
      );

    return mock.object;
  }

  public static CreateOpsupportSyncJournalCollection(propertiesCollection: OpsupportSyncJournalMock[]): OpsupportSyncJournal[] {
    return propertiesCollection.map((properties) => {
      const mock = TypeMoq.Mock.ofType<OpsupportSyncJournal>();
      mock
        .setup((property) => property.CreationTime)
        .returns(() => CreateIReadValue(properties.CreationTime, CreateIEntityColumn(properties.CreationTime.toLocaleString())));
      mock.setup((property) => property.ProjectionConfigDisplay).returns(() => CreateIReadValue(properties.ProjectionConfigDisplay));
      mock.setup((property) => property.ProjectionStartInfoDisplay).returns(() => CreateIReadValue(properties.ProjectionStartInfoDisplay));
      mock.setup((property) => property.ProjectionState).returns(() => CreateIReadValue(properties.ProjectionState));
      mock.setup((property) => property.UID_DPRJournal).returns(() => CreateIReadValue(properties.UID_DPRJournal));
      mock.setup((property) => property.UID_DPRProjectionConfig).returns(() => CreateIReadValue(properties.UID_DPRProjectionConfig));
      return mock.object;
    });
  }

  public static CreateSingleOpsupportQueueTreeBranch(properties: OpsupportQueueTreeParams): IEntity {
    const columns = {};
    for (var prop in properties) {
      if (Object.prototype.hasOwnProperty.call(properties, prop)) {
        columns[prop] = this.createColumn(properties[prop]);
      }
    }
    return this.createEntity(columns);
    // const mock = TypeMoq.Mock.ofType<OpsupportQueueTree>();
    // mock.setup(obj => obj.UID_Job).returns(() => CreateIReadValue(properties.UID_Job ? properties.UID_Job : ''));
    // mock.setup(obj => obj.BasisObjectKey).returns(() => CreateIReadValue(properties.BasisObjectKey ? properties.BasisObjectKey : ''));
    // mock.setup(obj => obj.DeferOnError).returns(() => CreateIReadValue(properties.DeferOnError ? properties.DeferOnError : false));
    // mock.setup(obj => obj.ErrorMessages).returns(() => CreateIReadValue(properties.ErrorMessages ? properties.ErrorMessages : ''));
    // mock.setup(obj => obj.GenProcID).returns(() => CreateIReadValue(properties.GenProcID ? properties.GenProcID : ''));
    // mock.setup(obj => obj.IsRootJob).returns(() => CreateIReadValue(properties.IsRootJob ? properties.IsRootJob : false));
    // mock.setup(obj => obj.JobChainName).returns(() => CreateIReadValue(properties.JobChainName ? properties.JobChainName : ''));
    // mock.setup(obj => obj.LimitationCount).returns(() => CreateIReadValue(properties.LimitationCount ? properties.LimitationCount : 0));
    // mock.setup(obj => obj.Queue).returns(() => CreateIReadValue(properties.Queue ? properties.Queue : ''));
    // mock.setup(obj => obj.Ready2EXE).returns(() => CreateIReadValue(properties.Ready2EXE ? properties.Ready2EXE : ''));
    // mock.setup(obj => obj.TaskName).returns(() => CreateIReadValue(properties.TaskName ? properties.TaskName : ''));
    // mock.setup(obj => obj.UID_JobError).returns(() => CreateIReadValue(properties.UID_JobError ? properties.UID_JobError : ''));
    // mock.setup(obj => obj.UID_JobOrigin).returns(() => CreateIReadValue(properties.UID_JobOrigin ? properties.UID_JobOrigin : ''));
    // mock.setup(obj => obj.UID_JobSameServer)
    //   .returns(() => CreateIReadValue(properties.UID_JobSameServer ? properties.UID_JobSameServer : ''));
    // mock.setup(obj => obj.UID_JobSuccess).returns(() => CreateIReadValue(properties.UID_JobSuccess ? properties.UID_JobSuccess : ''));
    // mock.setup(obj => obj.UID_Tree).returns(() => CreateIReadValue(properties.UID_Tree ? properties.UID_Tree : ''));
    // mock.setup(obj => obj.XDateInserted)
    //   .returns(() => CreateIReadValue(properties.XDateInserted ? properties.XDateInserted : new Date(2001, 1, 1)));
    // mock.setup(obj => obj.XDateUpdated)
    //   .returns(() => CreateIReadValue(properties.XDateUpdated ? properties.XDateUpdated : new Date(2001, 1, 1)));
    // mock.setup(obj => obj.XUserInserted).returns(() => CreateIReadValue(properties.XUserInserted ? properties.XUserInserted : ''));
    // mock.setup(obj => obj.XUserUpdated).returns(() => CreateIReadValue(properties.XUserUpdated ? properties.XUserUpdated : ''));
    // return mock.object;
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
    const mock = TypeMoq.Mock.ofType<OpsupportQueueFrozenjobs>();
    mock
      .setup((property) => property.TaskName)
      .returns(() => CreateIReadValue(properties.TaskName, CreateIEntityColumn(properties.TaskName)));
    mock
      .setup((property) => property.JobChainName)
      .returns(() => CreateIReadValue(properties.JobChainName, CreateIEntityColumn(properties.JobChainName)));
    mock.setup((property) => property.UID_Tree).returns(() => CreateIReadValue(properties.Uid_Tree));
    mock.setup((property) => property.UID_Job).returns(() => CreateIReadValue(properties.Uid_Job));
    mock.setup((property) => property.UID_JobSuccess).returns(() => CreateIReadValue(properties.Uid_JobSuccess));
    mock.setup((property) => property.UID_JobError).returns(() => CreateIReadValue(properties.Uid_JobError));
    mock
      .setup((property) => property.ErrorMessages)
      .returns(() => CreateIReadValue(properties.ErrorMessages ? properties.ErrorMessages : ''));
    mock.setup((property) => property.Queue).returns(() => CreateIReadValue(properties.Queue));
    mock.setup((property) => property.Retries).returns(() => CreateIReadValue(properties.Retries));
    mock.setup((property) => property.Ready2EXE).returns(() => CreateIReadValue(properties.ReadyToExe));
    mock.setup((property) => property.IsRootJob).returns(() => CreateIReadValue(properties.IsRootJob));
    mock.setup((property) => property.XDateInserted).returns(() => CreateIReadValue(properties.XDateInserted));
    return mock.object;
  }

  public static CreateOpsupportSyncShellCollection(propertiesCollection: IOpsupportSyncShell[]): OpsupportSyncShell[] {
    return propertiesCollection.map((properties) => {
      const mock = TypeMoq.Mock.ofType<OpsupportSyncShell>();
      mock
        .setup((property) => property.CountJournalFailure)
        .returns(() => CreateIReadValue(properties.CountJournalFailure, CreateIEntityColumn(properties.CountJournalFailure.toString())));
      mock
        .setup((property) => property.Description)
        .returns(() => CreateIReadValue(properties.Description, CreateIEntityColumn(properties.Description)));
      mock
        .setup((property) => property.DisplayName)
        .returns(() => CreateIReadValue(properties.DisplayName, CreateIEntityColumn(properties.DisplayName)));
      mock
        .setup((property) => property.LastSyncCountObjects)
        .returns(() => CreateIReadValue(properties.LastSyncCountObjects, CreateIEntityColumn(properties.LastSyncCountObjects.toString())));
      mock
        .setup((property) => property.NextSyncDate)
        .returns(() => CreateIReadValue(properties.NextSyncDate, CreateIEntityColumn(properties.NextSyncDate.toLocaleString())));
      mock
        .setup((property) => property.UID_DPRShell)
        .returns(() => CreateIReadValue(properties.UID_DPRShell, CreateIEntityColumn(properties.UID_DPRShell)));
      return mock.object;
    });
  }

  public static CreateOpsupportQueueJobsCollection(propertiesCollection: IJobQueueParams[]): OpsupportQueueJobs[] {
    return propertiesCollection.map((properties) => {
      const mock = TypeMoq.Mock.ofType<OpsupportQueueJobs>();
      mock.setup((property) => property.TaskName).returns(() => CreateIReadValue(properties.TaskName));
      mock.setup((property) => property.JobChainName).returns(() => CreateIReadValue(properties.JobChainName));
      mock.setup((property) => property.UID_Tree).returns(() => CreateIReadValue(properties.Uid_Tree));
      mock.setup((property) => property.UID_Job).returns(() => CreateIReadValue(properties.Uid_Job));
      mock.setup((property) => property.UID_JobSuccess).returns(() => CreateIReadValue(properties.Uid_JobSuccess));
      mock.setup((property) => property.UID_JobError).returns(() => CreateIReadValue(properties.Uid_JobError));
      mock.setup((property) => property.Queue).returns(() => CreateIReadValue(properties.Queue));
      mock.setup((property) => property.Retries).returns(() => CreateIReadValue(properties.Retries));
      mock.setup((property) => property.Ready2EXE).returns(() => CreateIReadValue(properties.ReadyToExe));
      mock.setup((property) => property.IsRootJob).returns(() => CreateIReadValue(properties.IsRootJob));
      mock.setup((property) => property.XDateInserted).returns(() => CreateIReadValue(properties.XDateInserted));
      mock.setup((property) => property.CombinedStatus).returns(() => CreateIReadValue(properties.CombinedStatus));
      return mock.object;
    });
  }

  public static CreateOpsupportQueueJobperformanceCollection(propertiesCollection: IJobQueueParams[]): OpsupportQueueJobperformance[] {
    return propertiesCollection.map((properties) => {
      const mock = TypeMoq.Mock.ofType<OpsupportQueueJobperformance>();
      mock.setup((property) => property.TaskName).returns(() => CreateIReadValue(properties.TaskName));
      mock.setup((property) => property.Queue).returns(() => CreateIReadValue(properties.Queue));
      mock.setup((property) => property.ComponentClass).returns(() => CreateIReadValue('componentClassDummy'));
      mock.setup((property) => property.CountPerMinute).returns(() => CreateIReadValue(23));
      return mock.object;
    });
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
        numOfEntries
      )
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
      numOfEntries
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
      numOfEntries
    );
  }
}

export class DummyJobData {
  static getItem(params: IJobQueueParams): OpsupportQueueJobs {
    const dummyTaskName = TypeMoq.Mock.ofType<IReadValue<string>>();
    const dummyJobChainName = TypeMoq.Mock.ofType<IReadValue<string>>();
    const dummyUidTree = TypeMoq.Mock.ofType<IReadValue<string>>();
    const dummyUidJob = TypeMoq.Mock.ofType<IReadValue<string>>();
    const dummyUidJobSuccess = TypeMoq.Mock.ofType<IReadValue<string>>();
    const dummyUidJobError = TypeMoq.Mock.ofType<IReadValue<string>>();
    const dummyQueue = TypeMoq.Mock.ofType<IReadValue<string>>();
    const dummyRetries = TypeMoq.Mock.ofType<IReadValue<number>>();
    const dummyIsRootJob = TypeMoq.Mock.ofType<IReadValue<boolean>>();
    const dummyXDataInserted = TypeMoq.Mock.ofType<IReadValue<Date>>();
    const dummyReadyToExe = TypeMoq.Mock.ofType<IReadValue<string>>();

    dummyTaskName.setup((el) => el.value).returns(() => (params.TaskName ? params.TaskName : ''));
    dummyJobChainName.setup((el) => el.value).returns(() => (params.JobChainName ? params.JobChainName : ''));
    dummyUidTree.setup((el) => el.value).returns(() => params.Uid_Tree);
    dummyUidJob.setup((el) => el.value).returns(() => params.Uid_Job);
    dummyUidJobSuccess.setup((el) => el.value).returns(() => (params.Uid_JobSuccess ? params.Uid_JobSuccess : ''));
    dummyUidJobError.setup((el) => el.value).returns(() => (params.Uid_JobError ? params.Uid_JobError : ''));
    dummyQueue.setup((el) => el.value).returns(() => (params.Queue ? params.Queue : ''));
    dummyRetries.setup((el) => el.value).returns(() => (params.Retries ? params.Retries : 0));
    dummyIsRootJob.setup((el) => el.value).returns(() => (params.IsRootJob ? params.IsRootJob : false));
    dummyXDataInserted.setup((el) => el.value).returns(() => (params.XDateInserted ? params.XDateInserted : new Date(2001, 1, 1)));
    dummyReadyToExe.setup((el) => el.value).returns(() => (params.ReadyToExe ? params.ReadyToExe : 'TRUE'));

    const dummy = TypeMoq.Mock.ofType<OpsupportQueueJobs>();
    dummy.setup((obj) => obj.TaskName).returns(() => dummyTaskName.object);
    dummy.setup((obj) => obj.JobChainName).returns(() => dummyJobChainName.object);
    dummy.setup((obj) => obj.UID_Tree).returns(() => dummyUidTree.object);
    dummy.setup((obj) => obj.UID_Job).returns(() => dummyUidJob.object);
    dummy.setup((obj) => obj.UID_JobSuccess).returns(() => dummyUidJobSuccess.object);
    dummy.setup((obj) => obj.UID_JobError).returns(() => dummyUidJobError.object);
    dummy.setup((obj) => obj.Queue).returns(() => dummyQueue.object);
    dummy.setup((obj) => obj.Retries).returns(() => dummyRetries.object);
    dummy.setup((obj) => obj.IsRootJob).returns(() => dummyIsRootJob.object);
    dummy.setup((obj) => obj.XDateInserted).returns(() => dummyXDataInserted.object);
    dummy.setup((obj) => obj.Ready2EXE).returns(() => dummyReadyToExe.object);
    dummy.setup((obj) => obj.CombinedStatus).returns(() => CreateIReadValue(params.CombinedStatus));

    return dummy.object;
  }
}
