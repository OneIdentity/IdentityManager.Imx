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
import { Routes, RouterModule } from '@angular/router';
import { InitService } from './init.service';
import {HELP_CONTEXTUAL, RouteGuardService} from 'qbm';
import { CallsComponent } from './calls/calls.component';
import { CallsModule } from './calls/calls.module';

const routes: Routes = [
  {
    path: 'help-desk-support/tickets',
    component: CallsComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
    data:{
      contextId: HELP_CONTEXTUAL.HelpDeskSupportTickets
    }
  }
];

@NgModule({
  imports: [
    CallsModule,
    RouterModule.forChild(routes)
  ]
})
export class HdsConfigModule {
  constructor(private readonly initializer: InitService) {
    console.log('🔥 HDS loaded');
    this.initializer.onInit(routes);

    console.log('▶️ HDS initialized');
  }
}
