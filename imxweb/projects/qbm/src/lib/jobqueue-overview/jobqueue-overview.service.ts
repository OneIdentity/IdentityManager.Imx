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

import { ErrorHandler, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { interval, Subscription } from 'rxjs';

import { ClassloggerService } from '../classlogger/classlogger.service';
import { AppConfigService } from '../appConfig/appConfig.service';
import { imx_SessionService } from '../session/imx-session.service';
import { EventStreamConfig } from 'imx-api-qbm';
import { EntityCollectionChangeData, EntityData } from 'imx-qbm-dbts';
import _ from 'lodash';

export interface JobQueueGroups {
  Error?: number;
  Waiting?: number;
  Ready?: number;
  Processing?: number;
  Finished?: number;
}

export interface JobQueueDataSlice {
  Time?: Date[];
  Error?: number[];
  Waiting?: number[];
  Ready?: number[];
  Processing?: number[];
  Finished?: number[];
}

@Injectable({
  providedIn: 'root',
})
export class JobQueueOverviewService {
  // External values
  public isAvailable = false;
  public isAvailablePromise: Promise<void>;
  public queueNames: string[] = [];
  public totalStreamName: string;

  // Config Params
  public configParams: EventStreamConfig;

  private stream: EventSource;
  private entities = {};
  private table: object[][] = [];
  private routineSubscription: Subscription;
  private uidToName = {};
  private axisTimes: Date[] = [];

  constructor(
    private appConfigService: AppConfigService,
    public session: imx_SessionService,
    public translateService: TranslateService,
    private logger: ClassloggerService,
    private errorHandler: ErrorHandler
  ) {
    this.translateService.get('#LDS#All queues').subscribe((trans: string) => (this.totalStreamName = trans));
    this.isAvailablePromise = new Promise((resolve, reject) => {
      const promiseInterval = setInterval(() => {
        if (this.isAvailable) {
          resolve();
          clearInterval(promiseInterval);
        }
      });
    });
  }

  public async setUp(): Promise<void> {
    // Grab config params
    this.configParams = await this.session.Client.opsupport_streamconfig_get();

    // Setup connection and event triggers
    this.stream = new EventSource(this.appConfigService.BaseUrl + '/opsupport/queue/overview/stream', {
      withCredentials: true,
    });

    this.stream.onopen = () => {
      this.logger.debug(this, 'Persistent stream has been created 👍');
    };

    this.stream.onmessage = (evt) => {
      const changeData: EntityCollectionChangeData = JSON.parse(evt.data);
      this.updateValues(changeData);
    };

    this.stream.onerror = (err) => {
      this.logger.error('JobQueueOverview: An error occured in data stream: ', err);
      this.isAvailable = false;
    };
    const routine = interval(this.configParams.RefreshIntervalSeconds * 1000);
    this.routineSubscription = routine.subscribe(() => this.jobLoop());
  }

  public updateValues(changeData: EntityCollectionChangeData): void {
    // Maintain current state of entities
    let uid: string;
    let name: string;
    // Decision tree for messages
    if (changeData.New) {
      // Loop over each entity to add to the queues
      changeData.New.forEach((entity) => {
        name = entity.Columns['QueueName'].Value;
        uid = entity.Columns['UID_QBMJobqueueOverview'].Value;
        this.addEntity(name, entity);
        this.uidToName[uid] = name;
      });
      this.checkTotalExists(changeData.New[0]);
    } else if (changeData.Updates) {
      // Loop over all incoming updates, to see if we potentially have more than one queue to update at a time
      for (uid of Object.keys(changeData.Updates)) {
        name = this.uidToName[uid];
        this.updateEntites(uid, name, changeData.Updates);
      }
      this.getTotals();
    } else {
      this.errorHandler.handleError('JobQueueOverview: Incoming data is not New/Updates 😢');
    }
  }

  public checkTotalExists(example: EntityData): void {
    // Check if total queue exists, if not create it off an example entity
    if (!this.queueNames.includes(this.totalStreamName)) {
      this.queueNames.unshift(this.totalStreamName);
      this.addEntity(this.totalStreamName, example, true);
      this.getTotals();
    }
  }

  public addEntity(name: string, entity: EntityData, isTotal: boolean = false): void {
    // Add this entity to the list
    this.entities[name] = {};
    for (const [key, value] of Object.entries(entity.Columns)) {
      if (key.includes('Count')) {
        this.entities[name][key] = isTotal ? 0 : value.Value;
      }
    }
    // Check if name is already in queue list, prevents total queue from being duped
    if (!this.queueNames.includes(name)) {
      this.queueNames.push(name);
    }
    this.isAvailable = true;
  }

  public updateEntites(uid: string, name: string, entity: object): void {
    // Take name of queue and contents of message and update the current entity state
    for (const key of Object.keys(entity[uid])) {
      if (key.includes('Count')) {
        this.entities[name][key] = entity[uid][key].Value;
      }
    }
  }

  public getTotals(): void {
    // Zero out values
    for (const key of Object.keys(this.entities[this.totalStreamName])) {
      this.entities[this.totalStreamName][key] = 0;
    }
    // Cumulatively add up all queue entries
    this.queueNames.forEach((queue) => {
      if (queue !== this.totalStreamName) {
        for (const [key, value] of Object.entries(this.entities[queue])) {
          this.entities[this.totalStreamName][key] += value;
        }
      }
    });
  }

  public jobLoop(): void {
    // Maintain the internal table of data

    // Check if the session state is logged out, shutdown and exit if so
    if (this.session.SessionState.IsLoggedOut) {
      this.shutdown();
      return;
    }

    // Check status of stream connection
    if (this.stream.readyState === 1) {
      this.isAvailable = true;
    } else {
      this.isAvailable = false;
    }

    // Data check
    this.pushTable();
  }

  public pushTable(): void {
    const currentTable: object[] = this.table.pop();
    const incomingTable: object[] = [];
    // Replace popped table, if not empty (faster as easier to pop)
    if (currentTable) {
      this.table.push(currentTable);
    }

    // Loop through queues to form new table
    this.queueNames.forEach((queue) => {
      const groups = this.computeGroups(queue);
      incomingTable.push(groups);
    });

    // We have no data to use, don't append any blank values - usually caused when server hasn't started yet
    if (incomingTable.length === 0) {
      return;
    }

    if (_.isEqual(incomingTable, currentTable)) {
      // Don't add, replace time point with current time
      this.axisTimes.splice(-1, 1, new Date());
    } else {
      // Add new table and time
      this.table.push(incomingTable);
      this.axisTimes.push(new Date());
    }

    // Cull old values off newest push
    this.cullTable();
  }

  public cullTable(): void {
    // Check we have at least two points to cull
    if (this.axisTimes.length > 1) {
      // Check the furthest point in time is sufficiently far to cull
      const now = new Date().getTime();
      if (now - this.axisTimes[0].getTime() > this.configParams.HistorySeconds * 1000) {
        this.table.shift();
        this.axisTimes.shift();
      }
    }
  }

  public getSlice(queue: string): JobQueueDataSlice {
    const slice: JobQueueDataSlice = {} as JobQueueDataSlice;

    // Safeguard if we haven't yet initialized from the component
    if (!queue) {
      return slice;
    }

    slice.Time = this.axisTimes;
    const queueIndex = this.queueNames.findIndex((e) => e === queue);
    // Safeguard that the queue wasnt found
    if (queueIndex === -1) {
      return slice;
    }
    this.axisTimes.forEach((e, timeIndex) => {
      for (const [name, value] of Object.entries(this.table[timeIndex][queueIndex])) {
        // Append to array or initialize
        if (slice[name]) {
          slice[name].push(value);
        } else {
          slice[name] = [value];
        }
      }
    });
    return slice;
  }

  public computeGroups(queue: string): JobQueueGroups {
    const thisEntity = this.entities[queue];
    const output: JobQueueGroups = {
      Error: thisEntity.CountFrozen + thisEntity.CountOverlimt + thisEntity.CountMissing,
      Waiting: thisEntity.CountFalse,
      Ready: thisEntity.CountTrue,
      Processing: thisEntity.CountLoaded + thisEntity.CountProcessing,
      Finished: thisEntity.CountFinished + thisEntity.CountHistory + thisEntity.CountDelete,
    };
    return output;
  }

  public shutdown(): void {
    // Destroy connections and clean data
    this.stream.close();
    this.routineSubscription?.unsubscribe();

    this.queueNames = [];
    this.isAvailable = false;
    this.axisTimes = [];
    this.entities = {};
    this.table = [];
    this.logger.debug(this, 'Stream has successfully shutdown 👍');
  }
}
