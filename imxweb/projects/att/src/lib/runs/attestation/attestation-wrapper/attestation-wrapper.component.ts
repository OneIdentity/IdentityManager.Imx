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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicTabDataProviderDirective } from 'qbm';

import { HelperAlertContent, ObjectAttestationStatistics } from 'qer';
import { Subscription } from 'rxjs';
import { IdentityAttestationService } from '../../../identity-attestation.service';

@Component({
  templateUrl: './attestation-wrapper.component.html',
  styleUrls: ['./attestation-wrapper.component.scss']
})
export class AttestationWrapperComponent implements OnInit, OnDestroy{
  public referrer: { objecttable: string; objectuid: string; };
  public readonly pendingAttestations: HelperAlertContent = { loading: false };
  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly attestations: IdentityAttestationService,
    dataProvider: DynamicTabDataProviderDirective){
      this.referrer = dataProvider.data;
    }

  public ngOnInit(): void {
    if (this.attestations) {
      this.subscriptions.push(this.attestations.applied.subscribe(() => this.updatePendingAttestations()));

      this.updatePendingAttestations();
    }

  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private async updatePendingAttestations(): Promise<void> {

    this.pendingAttestations.loading = true;

    const statistics: ObjectAttestationStatistics = await this.attestations.getNumberOfPendingForUser(this.referrer);

    if (!statistics?.total) {
      this.pendingAttestations.infoItems = [
        { description: '#LDS#There are currently no attestation cases for this object.' }
      ];
    } else {
      this.pendingAttestations.infoItems = [
        { description: '#LDS#Here you can get an overview of all attestations cases for this object.' },
        { description: '#LDS#Pending attestation cases: {0}', value: statistics.pendingTotal },
        { description: '#LDS#Pending attestation cases you can approve or deny: {0}', value: statistics.pendingForUser }
      ];
    }

    this.pendingAttestations.loading = false;
  }
}
