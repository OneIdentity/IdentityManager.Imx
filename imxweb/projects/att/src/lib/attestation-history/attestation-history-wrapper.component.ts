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

import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

import { TypedEntity } from '@imx-modules/imx-qbm-dbts';
import { AuthenticationService, DataViewSource } from 'qbm';
import { AttestationHistoryActionService } from './attestation-history-action.service';
import { AttestationHistoryCase } from './attestation-history-case';
import { AttestationHistoryComponent } from './attestation-history.component';

@Component({
  selector: 'imx-attestation-history-wrapper',
  templateUrl: './attestation-history-wrapper.component.html',
  styleUrls: ['./attestation-history-wrapper.component.scss'],
})
export class AttestationHistoryWrapperComponent implements OnDestroy, AfterViewInit {
  @ViewChild('attestationHistoryComponent', { static: false }) public attestationHistoryComponent: AttestationHistoryComponent;
  public dataSource: DataViewSource<AttestationHistoryCase>;
  public get canPerformActions(): boolean {
    return this.selectedCases.length > 0 && (this.canRecallDecision || this.canWithdrawDelegation);
  }
  public get canWithdrawDelegation(): boolean {
    return this.selectedCases.every((item) => item.canWithdrawDelegation(this.userUid));
  }
  public get canRecallDecision(): boolean {
    return this.selectedCases.every((item) => item.canRecallDecision);
  }

  public selectedCases: AttestationHistoryCase[] = [];

  private userUid: string;

  private readonly subscriptions: Subscription[] = [];

  constructor(
    public readonly attestationAction: AttestationHistoryActionService,
    authentication: AuthenticationService,
    public changeDetectionRef: ChangeDetectorRef,
  ) {
    this.subscriptions.push(authentication.onSessionResponse?.subscribe((sessionState) => (this.userUid = sessionState?.UserUid || '')));
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  ngAfterViewInit(): void {
    this.dataSource = this.attestationHistoryComponent?.dataSource;
    this.changeDetectionRef.detectChanges();
  }

  public onSelectionChanged(items: TypedEntity[]): void {
    this.selectedCases = items as AttestationHistoryCase[];
  }
}
