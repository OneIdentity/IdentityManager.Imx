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

import { Component, OnInit, ErrorHandler } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EuiLoadingService } from '@elemental-ui/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { MatTabChangeEvent } from '@angular/material/tabs';

import { DbObjectKey, DisplayColumns, EntitySchema, IClientProperty, ReadOnlyEntity, ValType } from 'imx-qbm-dbts';
import { ShapeData } from 'imx-api-qbm';
import {
  MetadataService,
  imx_SessionService,
  MessageParameter,
  MessageDialogComponent,
  OpsupportDbObjectService,
  ShapeClickArgs,
  ClassloggerService,
  DataSourceToolbarSettings,
  AuthenticationService,
  ClientPropertyForTableColumns
} from 'qbm';
import { QueueJobsService } from '../processes/jobs/queue-jobs.service';
import { MatDialog } from '@angular/material/dialog';
import { ObjectOverviewContainer, FeatureConfigService  } from 'qer';
import { HyperviewService } from './hyperview/hyperview.service';
import { ObjectOverviewService } from './object-overview.service';
import { PersonDbQueueInfo } from './person-db-queue-info';
import { PersonJobQueueInfo } from './person-job-queue-info';

@Component({
  templateUrl: './object-overview.component.html',
  styleUrls: ['./object-overview.component.scss']
})
export class ObjectOverviewComponent implements OnInit, ObjectOverviewContainer {

  public hyperviewShapes: ShapeData[] = [];

  public DisplayColumns = DisplayColumns;

  public jobTotal = 0;
  public dbTotal = 0;
  public queuesUnsupported = false;
  public readonly entitySchemaJobs: EntitySchema;
  public readonly entitySchemaDbs: EntitySchema;

  public displayedColumnsJobs: ClientPropertyForTableColumns[];
  public displayedColumnsDbs: IClientProperty[];

  public dstSettingsJobs: DataSourceToolbarSettings;
  public dstSettingsDb: DataSourceToolbarSettings;

  public showPassCodeTab: boolean;

  public objectKey: DbObjectKey;
  public tableDisplay: string;
  public display: string;
  private tablename: string;

  private readonly tablePerson = 'person';
  private objectUID: string;
  private uidUser: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private errorHandler: ErrorHandler,
    private dialogService: MatDialog,
    private dbObjectService: OpsupportDbObjectService,
    private jobService: QueueJobsService,
    private metadataService: MetadataService,
    private translationProvider: TranslateService,
    private logger: ClassloggerService,
    private hyperview: HyperviewService,
    private busyService: EuiLoadingService,
    private overviewService: ObjectOverviewService,
    private featureService: FeatureConfigService,
    authentication: AuthenticationService,
  ) {

    this.entitySchemaDbs = PersonDbQueueInfo.GetEntitySchema();
    this.entitySchemaJobs = PersonJobQueueInfo.GetEntitySchema();

    this.displayedColumnsJobs = [
      this.entitySchemaJobs.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchemaJobs.Columns.Queue,
      this.entitySchemaJobs.Columns.TaskName,
      {
        ColumnName: 'actions',
        Type: ValType.String,
        afterAdditionals: true
      }
    ];

    this.displayedColumnsDbs = [
      this.entitySchemaDbs.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchemaDbs.Columns.Object,
      this.entitySchemaDbs.Columns.SubObject,
      this.entitySchemaDbs.Columns.SortOrder,
    ];

    authentication.onSessionResponse.subscribe(session => this.uidUser = session.UserUid);
  }

  public async ngOnInit(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      await this.initDataFromPath(this.route);
      const featureConfig = await this.featureService.getFeatureConfig();
      this.showPassCodeTab = featureConfig.EnableSetPasswords
        && this.objectKey.TableName.toLowerCase() === this.tablePerson
        && this.uidUser !== this.objectUID;
      await this.loadQueue();
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public async onTabChange(event: MatTabChangeEvent): Promise<void> {
    const hyperLabel = await this.translationProvider.get('#LDS#Hyperview').toPromise();
    if (event.tab.textLabel === hyperLabel) {
      let overlayRef: OverlayRef;
      setTimeout(() => overlayRef = this.busyService.show());
      try {
        this.hyperviewShapes = await this.hyperview.Get({ table: this.tablename, uid: this.objectUID });
      } finally {
        setTimeout(() => this.busyService.hide(overlayRef));
      }
    }
  }



  // Checks if the item has an ErrorMessage or not
  public hasContent(item: PersonJobQueueInfo): boolean {
    return item.ErrorMessages.value !== '';
  }

  // Checks if a job is frozen
  public isFrozen(item: PersonJobQueueInfo): boolean {
    return item.Ready2EXE.value.toUpperCase() === 'FROZEN';
  }

  // Reactivates a job
  public reactivate(item: PersonJobQueueInfo): void {
    this.jobService
      .Post([item.UID_Job.value])
      .then((_: any) => this.loadQueue('jobQueue'))
      .catch((err: any) => this.errorHandler.handleError(err));
  }

  // Shows the error message for a JobQueueInfo object
  public async showMessage(item: PersonJobQueueInfo): Promise<void> {
    const messageData: MessageParameter = {
      ShowOk: true,
      Title: await this.translationProvider.get('#LDS#Error message').toPromise(),
      Message: item.ErrorMessages.Column.GetDisplayValue()
    };
    this.dialogService.open(MessageDialogComponent, { data: messageData, panelClass: 'imx-messageDialog' });
  }

  public goToStart(): void {
    this.router.navigate(['start']);
  }

  public select(ev: ShapeClickArgs): void {
    // TODO remove error-logging with the correct select action: maybe the navigating to the objectoverview of th selected object
    this.logger.error(this, 'selection trigged for: ' + ev.objectKey);
  }

  public async loadQueue(updateType: 'both' | 'jobQueue' | 'dbQueue' = 'both'): Promise<void> {
    const cached = await this.overviewService.get(this.objectKey);
    this.queuesUnsupported = cached.Unsupported;

    if (this.queuesUnsupported) {
      return;
    }

    if (updateType === 'both' || updateType === 'jobQueue') {
      const job = cached.JobQueue.map(entityData =>
        new PersonJobQueueInfo((new ReadOnlyEntity(PersonJobQueueInfo.GetEntitySchema(), entityData))));

      this.jobTotal = job.length;

      this.dstSettingsJobs = {
        displayedColumns: this.displayedColumnsJobs,
        dataSource: { Data: job, totalCount: job.length },
        entitySchema: this.entitySchemaJobs,
        navigationState: {}
      };
    }

    if (updateType === 'both' || updateType === 'dbQueue') {
      const db = cached.DbQueue.map(entityData =>
        new PersonDbQueueInfo((new ReadOnlyEntity(PersonDbQueueInfo.GetEntitySchema(), entityData))));

      this.dbTotal = db.length;

      this.dstSettingsDb = {
        displayedColumns: this.displayedColumnsDbs,
        dataSource: { Data: db, totalCount: db.length },
        entitySchema: this.entitySchemaDbs,
        navigationState: {}
      };
    }
  }

  // initializes the variables provided by the route
  private async initDataFromPath(route: ActivatedRoute): Promise<void> {
    const snapShotMap = route.snapshot.paramMap;

    this.tablename = snapShotMap.get('table');
    this.objectUID = snapShotMap.get('uid');
    this.objectKey = new DbObjectKey(this.tablename, this.objectUID);

    const metadata = await this.metadataService.GetTableMetadata(this.tablename);
    this.tableDisplay = metadata.DisplaySingular;

    const entity = await this.dbObjectService.Get({ tableName: this.tablename, uid: this.objectUID });
    this.display = entity.Display;
  }

}
