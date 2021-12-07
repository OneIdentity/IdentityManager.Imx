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
 * Copyright 2021 One Identity LLC.
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
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EuiLoadingService } from '@elemental-ui/core';

import { ClassloggerService } from 'qbm';
import { EntityData } from 'imx-qbm-dbts';
import { QerApiService } from '../qer-api-client.service';

@Component({
  templateUrl: './risk.component.html',
  styleUrls: ['./risk.component.scss']
})
export class RiskAnalysisComponent implements OnInit {

  public object: EntityData;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly logger: ClassloggerService,
    private readonly busyService: EuiLoadingService,
    private readonly qerClient: QerApiService) { }

  public async ngOnInit(): Promise<void> {
    const tableName = this.route.snapshot.params.TableName;
    const uid = this.route.snapshot.params.UID;

    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      this.object = await this.qerClient.client.portal_dbobject_get(tableName, uid);

      if (!this.object) {
        this.logger.error(this, `No dbobject found for table "${tableName}" and uid "${uid}"`);
      }
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }
}
