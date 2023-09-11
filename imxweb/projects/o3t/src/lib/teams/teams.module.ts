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
import { TeamsComponent } from './teams.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { CdrModule, DataSourceToolbarModule, DataTableModule } from 'qbm';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TeamsService } from './teams.service';
import { TeamDetailsComponent } from './team-details/team-details.component';
import { TeamChannelsComponent } from './team-channels/team-channels.component';
import { TeamChannelDetailsComponent } from './team-channel-details/team-channel-details.component';



@NgModule({
  declarations: [TeamsComponent, TeamDetailsComponent, TeamChannelsComponent, TeamChannelDetailsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EuiCoreModule,
    EuiMaterialModule,
    CdrModule,
    RouterModule,
    TranslateModule,
    DataSourceToolbarModule,
    DataTableModule
  ],
  providers: [
    TeamsService
  ],
  exports: [
    TeamsComponent
  ]
})
export class TeamsModule { }
