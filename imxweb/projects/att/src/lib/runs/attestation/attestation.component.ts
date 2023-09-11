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

import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Subscription } from 'rxjs';

import { AuthenticationService, HELPER_ALERT_KEY_PREFIX, StorageService } from 'qbm';
import { AttestationHistoryCase } from '../../attestation-history/attestation-history-case';
import { AttestationHistoryActionService } from '../../attestation-history/attestation-history-action.service';
import { FilterData } from 'imx-qbm-dbts';
import { HelperAlertContent } from 'qer';

const helperAlertKey = `${HELPER_ALERT_KEY_PREFIX}_attestation`;

@Component({
  selector: 'imx-attestation',
  templateUrl: './attestation.component.html',
  styleUrls: ['./attestation.component.scss'],
})
export class AttestationComponent implements OnDestroy {
  public get canDecide(): boolean {
    return this.selectedCases.length > 0 && this.selectedCases.every((item) => this.itemStatus.enabled(item));
  }

  public get withAssignmentAnalysis(): boolean {
    return this.parameters?.objecttable === 'Person';
  }

  public get showHelperAlert(): boolean {
    return !this.storageService.isHelperAlertDismissed(helperAlertKey);
  }

  @Input() public parameters: { objecttable: string; objectuid: string; filter?: FilterData[] };
  @Input() public pendingAttestations: HelperAlertContent;

  public readonly itemStatus = {
    enabled: (attestationCase) => attestationCase.isPending && this.attestationAction.canDecide(attestationCase, this.userUid),
  };

  public selectedCases: AttestationHistoryCase[] = [];

  @Output() public cancel = new EventEmitter();

  private userUid: string;

  private readonly subscriptions: Subscription[] = [];

  constructor(
    public readonly attestationAction: AttestationHistoryActionService,
    private readonly storageService: StorageService,
    authentication: AuthenticationService
  ) {
    this.subscriptions.push(authentication.onSessionResponse?.subscribe((sessionState) => (this.userUid = sessionState?.UserUid)));
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public onSelectionChanged(items: AttestationHistoryCase[]): void {
    this.selectedCases = items;
  }

  public onHelperDismissed(): void {
    this.storageService.storeHelperAlertDismissal(helperAlertKey);
  }
}
