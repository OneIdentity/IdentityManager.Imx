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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { MatTreeModule } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';


import { DataSourceToolbarModule, DataTableModule, JobQueueOverviewModule, LdsReplaceModule, QbmModule } from 'qbm';
import { FrozenJobsComponent } from './frozen-jobs/frozen-jobs.component';
import { SingleFrozenJobComponent } from './frozen-jobs/single-frozen-job.component';
import { JobChainsComponent } from './job-chains/job-chains.component';
import { JobPerformanceComponent } from './job-performance/job-performance.component';
import { JobsGridviewComponent } from './jobs/jobs-gridview/jobs-gridview.component';
import { JobsComponent } from './jobs/jobs.component';
import { FrozenJobsService } from './frozen-jobs/frozen-jobs.service';
import { QueueTreeService } from './frozen-jobs/queue-tree.service';
import { JobChainsService } from './job-chains/job-chains.service';
import { JobPerformanceQueuesService } from './job-performance/job-performance-queues.service';
import { JobPerformanceService } from './job-performance/job-performance.service';
import { QueueJobsService } from './jobs/queue-jobs.service';
import { MatRadioModule } from '@angular/material/radio';


@NgModule({
  declarations: [
    FrozenJobsComponent,
    SingleFrozenJobComponent,
    JobChainsComponent,
    JobsGridviewComponent,
    JobsComponent,
    JobPerformanceComponent,
  ],
  imports: [
    CommonModule,
    QbmModule,
    EuiCoreModule,
    EuiMaterialModule,
    MatTreeModule,
    MatButtonModule,
    DataSourceToolbarModule,
    DataTableModule,
    LdsReplaceModule,
    MatRadioModule,
    MatFormFieldModule,
    MatSelectModule,
    TranslateModule,
    MatTooltipModule,
    EuiCoreModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    FormsModule,
    MatSlideToggleModule,
    JobQueueOverviewModule
  ],
  providers: [
    QueueTreeService,
    QueueJobsService,
    JobChainsService,
    JobPerformanceQueuesService,
    JobPerformanceService,
    FrozenJobsService,
  ]
})
export class ProcessesModule { }
