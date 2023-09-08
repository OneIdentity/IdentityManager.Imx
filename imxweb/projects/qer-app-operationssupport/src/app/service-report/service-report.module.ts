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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { EuiCoreModule } from '@elemental-ui/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { DataSourceToolbarModule, DataTableModule, CdrModule } from 'qbm';
import { JobServersGridviewComponent } from './job-servers-gridview.component';
import { ServiceAvailabilityComponent } from './service-availability.component';
import { ServiceReportComponent } from './service-report.component';
import { ServicesInactiveComponent } from './services-inactive.component';
import { JobServersService } from './job-servers.service';
import { JobServersEditComponent } from './job-servers-edit/job-servers-edit.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JobServersDetailsComponent } from './job-servers-details/job-servers-details.component';

@NgModule({
  declarations: [
    JobServersGridviewComponent,
    ServiceAvailabilityComponent,
    ServiceReportComponent,
    ServicesInactiveComponent,
    JobServersEditComponent,
    JobServersDetailsComponent,
  ],
  imports: [
    CdrModule,
    CommonModule,
    DataSourceToolbarModule,
    DataTableModule,
    EuiCoreModule,
    TranslateModule,
    MatCardModule,
    MatButtonModule,
    MatTooltipModule,
    FormsModule, 
    ReactiveFormsModule,
    MatTabsModule
  ],
  providers: [JobServersService],
  exports: [ServiceReportComponent]
})
export class ServiceReportModule { }
