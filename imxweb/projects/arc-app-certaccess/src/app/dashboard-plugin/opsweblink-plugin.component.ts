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

import { OverlayRef } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';
import { AppConfigService } from 'qbm';

import { UserModelService } from 'qer';

@Component({
  styleUrls: ['./opsweblink-plugin.component.scss'],
  templateUrl: './opsweblink-plugin.component.html'
})
export class OpsWebLinkPluginComponent implements OnInit {

  public isAdmin: boolean;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private readonly busyService: EuiLoadingService,
    private readonly appConfigService: AppConfigService,
    private readonly userModelSvc: UserModelService
  ) { }

  public async ngOnInit(): Promise<void> {

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());

    try {
      const groups = await this.userModelSvc.getGroups();
      this.isAdmin = groups.map(g => g.Name).includes('SIM_4_OPAAdmin');

    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public goToOperations(): void {
    const url = this.appConfigService.BaseUrl + '/html/qer-app-operationssupport';
    this.document.location.href = url;
  }
}
