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

import { Component, OnInit, OnDestroy } from '@angular/core';

import { AppConfigService } from 'qbm';
import { ServiceIssuesService } from './service-issues.service';
import { IssueItem } from './service-issues.models';

@Component({
  selector: 'imx-service-issues',
  templateUrl: './service-issues.component.html',
  styleUrls: ['./service-issues.component.scss', '../issue-tiles.scss']
})
export class ServiceIssuesComponent implements OnInit, OnDestroy {

  constructor( public service: ServiceIssuesService, private appConfigService: AppConfigService) {}

  public ngOnInit(): void {
    this.service.subscribe(this.appConfigService.Config.NotificationUpdateInterval);
  }

  public ngOnDestroy(): void {
    this.service.unsubscribe();
  }

  get issues(): IssueItem[] {
    return this.service.items;
  }
}
