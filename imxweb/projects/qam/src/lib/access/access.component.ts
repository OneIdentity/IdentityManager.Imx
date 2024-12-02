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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { BusyService, DynamicTabDataProviderDirective } from 'qbm';
import { QamApiService } from '../qam-api-client.service';
import { TrusteeAccessData } from '../TypedClient';

/** Shows access information for an account or a system entitlement. */
@Component({
  templateUrl: './access.component.html',
  styleUrls: ['./access.component.scss'],
})
export class AccessComponent implements OnInit, OnDestroy {
  public data: TrusteeAccessData;

  public referrer: { objecttable: string; objectuid: string; display: string };

  public busyService: BusyService;
  public isLoading: boolean = true;
  private subscription: Subscription | undefined;

  constructor(
    dataProvider: DynamicTabDataProviderDirective,
    private readonly qamApi: QamApiService,
  ) {
    this.referrer = dataProvider.data;
    this.busyService = new BusyService();
    this.subscription = this.busyService.busyStateChanged.subscribe((elem) => (this.isLoading = elem));
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      this.data = await this.qamApi.client.portal_dge_access_get(this.referrer.objecttable, this.referrer.objectuid);
    } finally {
      isBusy?.endBusy();
    }
  }
}
