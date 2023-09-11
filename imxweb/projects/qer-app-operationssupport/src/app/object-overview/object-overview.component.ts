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

import { Component, OnInit, ErrorHandler, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { DbObjectKey, DisplayColumns, EntitySchema, IClientProperty, ReadOnlyEntity, ValType } from 'imx-qbm-dbts';
import { QueueEntriesData, ShapeData } from 'imx-api-qbm';
import {
  MetadataService,
  OpsupportDbObjectService,
  ShapeClickArgs,
  ClassloggerService,
  DataSourceToolbarSettings,
  AuthenticationService,
  ClientPropertyForTableColumns
} from 'qbm';
import { QueueJobsService } from '../processes/jobs/queue-jobs.service';
import { ObjectOverviewContainer, FeatureConfigService  } from 'qer';
import { ObjectOverviewService } from './object-overview.service';
import { PersonDbQueueInfo } from './person-db-queue-info';
import { PersonJobQueueInfo } from './person-job-queue-info';
import { ErrorMessageSidesheetComponent } from '../processes/error-message-sidesheet/error-message-sidesheet.component';
import { EuiSidesheetService } from '@elemental-ui/core';

@Component({
  templateUrl: './object-overview.component.html',
  styleUrls: ['./object-overview.component.scss']
})
export class ObjectOverviewComponent implements OnInit, AfterViewInit, ObjectOverviewContainer {

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
  public tablename: string;
  public objectUID: string;

  private readonly tablePerson = 'person';
  private uidUser: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private errorHandler: ErrorHandler,
    private sidesheet: EuiSidesheetService,
    private dbObjectService: OpsupportDbObjectService,
    private jobService: QueueJobsService,
    private metadataService: MetadataService,
    private translationProvider: TranslateService,
    private logger: ClassloggerService,
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

  public busy = true;

  /**
   * Index of the selected tab.
   */
  public tabIndex = 0;

  public async ngOnInit(): Promise<void> {

    this.route.params.subscribe(res => {
      // reinitialize if params changes 
      if (this.objectUID !== res.uid) {        
        this.init();
        if (this.hasHyperviewParam(res.tab)) {
          this.tabIndex = 3;
        }
      }      
    })

    this.init();    
  }

  public async ngAfterViewInit(): Promise<void> {
    const param = this.route.snapshot.paramMap.get('tab');
    if (this.hasHyperviewParam(param)) {
      this.tabIndex = 3;
    }
  }

  /**
   * Handles the event, when a shape was clicked.
   * @param args the {@link ShapeClickArgs|arguments of the clicked shape}
   */
  public async onShapeClick(args: ShapeClickArgs) : Promise<void> {
    const objKey = DbObjectKey.FromXml(args.objectKey);

   if (await this.objectIsSupported(objKey)) {
    this.router.navigate(['object', objKey.TableName, objKey.Keys[0], 'hyperview']);
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

      await this.sidesheet
      .open(ErrorMessageSidesheetComponent, {
        title: await this.translationProvider.get('#LDS#Heading View Error Message').toPromise(),
        subTitle: item.GetEntity().GetDisplay(),
        padding: '0',
        width: 'max(60%,600px)',
        testId: 'error-message-sidesheet',
        data: item.ErrorMessages.Column.GetDisplayValue(),
      })
      .afterClosed()
      .toPromise();
  }

  public goToStart(): void {
    this.router.navigate(['start']);
  }

  public select(ev: ShapeClickArgs): void {
    // TODO remove error-logging with the correct select action: maybe the navigating to the objectoverview of th selected object
    this.logger.error(this, 'selection trigged for: ' + ev.objectKey);
  }

  public async loadQueue(updateType: 'both' | 'jobQueue' | 'dbQueue' = 'both'): Promise<void> {
    const cached = await this.objectIsSupported(this.objectKey);
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

  private async init(): Promise<void> {
    this.hyperviewShapes = [];
    this.busy = true;
    try {
      await this.initDataFromPath(this.route);
      const featureConfig = await this.featureService.getFeatureConfig();
      this.showPassCodeTab = featureConfig.EnableSetPasswords
        && this.objectKey.TableName.toLowerCase() === this.tablePerson
        && this.uidUser !== this.objectUID;
      await this.loadQueue();
    } finally {
      this.busy = false;
    }
  }

  /**
   * Check if the given object is supported.
   * @param objKey {@link DbObjectKey} that needs to check.
   * @returns 
   */
  private async objectIsSupported(objKey: DbObjectKey): Promise<QueueEntriesData> {
    const cached = await this.overviewService.get(objKey);
    this.queuesUnsupported = cached.Unsupported;

    if (this.queuesUnsupported) {
      this.logger.debug(this, `ObjectOverviewService: Object ${objKey.TableName} is not supported.`);
      return undefined;
    }
    return cached;
  }

  /**
   * Checks the route param if it's the hyperview-param.
   * @param param route param to check
   * @returns true, if it's the hyperview-param
   */
  private hasHyperviewParam(param: string): boolean {
    return param === 'hyperview';
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
