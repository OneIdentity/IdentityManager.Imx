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

import { Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';

import { ExtService } from 'qbm';
import { HelperAlertContent } from '../helper-alert-content/helper-alert-content.interface';
import { AttestationReferrer } from '../referrers/attestation-referrer.interface';
import { ObjectAttestationStatistics } from './object-attestation-statistics.interface';

@Component({
  selector: 'imx-object-attestation',
  templateUrl: './object-attestation.component.html',
  styleUrls: ['./object-attestation.component.scss']
})
export class ObjectAttestationComponent implements OnInit, OnDestroy, AttestationReferrer {
  public readonly pendingAttestations: HelperAlertContent = { loading: false };

  @Input() public parameters: { objecttable: string; objectuid: string; };

  @Output() public readonly created = new EventEmitter<boolean>();
  @Output() public readonly closed = new EventEmitter<void>();

  private readonly attestations: any;
  private readonly subscriptions: Subscription[] = [];

  constructor(private readonly extService: ExtService, private readonly injector: Injector) {
    const attestationService = this.extService.Registry.IdentityAttestationService?.slice(-1)[0];

    if (attestationService != null) {
      this.attestations = this.injector.get(attestationService.instance);
    }
  }

  public ngOnInit(): void {
    if (this.attestations) {
      this.subscriptions.push(this.attestations.applied.subscribe(() => this.updatePendingAttestations()));

      this.updatePendingAttestations();
    }

    this.created.emit(this.attestations != null);
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  public cancel(): void {
    this.closed.emit();
  }

  private async updatePendingAttestations(): Promise<void> {
    this.pendingAttestations.loading = true;

    const statistics: ObjectAttestationStatistics = await this.attestations.getNumberOfPendingForUser(this.parameters);

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
