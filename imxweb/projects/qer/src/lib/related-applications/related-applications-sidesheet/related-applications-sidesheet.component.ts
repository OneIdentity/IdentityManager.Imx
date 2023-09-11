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

import { Component, OnInit } from '@angular/core';
import { RelatedApplicationsService } from '../related-applications.service'
import { RelatedApplication } from 'imx-api-qer';
import { EuiLoadingService, EuiSidesheetRef } from '@elemental-ui/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { Router } from '@angular/router';

@Component({
  selector: 'imx-related-applications-sidesheet',
  templateUrl: './related-applications-sidesheet.component.html'
})
export class RelatedApplicationsSidesheetComponent implements OnInit {
  public applications:RelatedApplication[]=[];
  constructor(private relatedappService: RelatedApplicationsService,
    private readonly busyService: EuiLoadingService,
    private router: Router,
    private readonly sidesheetRef: EuiSidesheetRef) { }

  public async ngOnInit(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      this.applications= await this.relatedappService.getRelatedApplications();
    }
    finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  public displayApp(app:RelatedApplication):void {
    this.sidesheetRef.close();
    this.router.navigate(['applicationdetails'], {state: {data: app}});
  }

}
