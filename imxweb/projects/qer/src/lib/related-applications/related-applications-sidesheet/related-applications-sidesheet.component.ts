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
 * Copyright 2024 One Identity LLC.
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

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EuiLoadingService, EuiSidesheetRef } from '@elemental-ui/core';
import { RelatedApplication } from '@imx-modules/imx-api-qer';
import { RelatedApplicationsService } from '../related-applications.service';

@Component({
  selector: 'imx-related-applications-sidesheet',
  templateUrl: './related-applications-sidesheet.component.html',
})
export class RelatedApplicationsSidesheetComponent implements OnInit {
  public applications: RelatedApplication[] = [];
  constructor(
    private relatedappService: RelatedApplicationsService,
    private readonly busyService: EuiLoadingService,
    private router: Router,
    private readonly sidesheetRef: EuiSidesheetRef,
  ) {}

  public async ngOnInit(): Promise<void> {
    if (this.busyService.overlayRefs.length === 0) {
      this.busyService.show();
    }
    try {
      this.applications = await this.relatedappService.getRelatedApplications();
    } finally {
      this.busyService.hide();
    }
  }

  public displayApp(app: RelatedApplication): void {
    this.sidesheetRef.close();
    this.router.navigate(['applicationdetails'], { state: { data: app } });
  }
}
