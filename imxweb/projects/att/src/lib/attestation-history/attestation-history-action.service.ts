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

import { OverlayRef } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { AttestationCaseData, PortalAttestationCase } from 'imx-api-att';
import { IReadValue, ValType } from 'imx-qbm-dbts';
import { BaseCdr, ColumnDependentReference, EntityService, SnackBarService } from 'qbm';
import { AttestationActionComponent } from '../attestation-action/attestation-action.component';
import { AttestationCasesService } from '../decision/attestation-cases.service';
import { AttestationActionService } from '../attestation-action/attestation-action.service';
import { AttestationCaseAction } from '../attestation-action/attestation-case-action.interface';
import { ApproverContainer } from 'qer';

@Injectable({
  providedIn: 'root'
})
export class AttestationHistoryActionService {

  public readonly applied = new Subject();

  constructor(
    private readonly attestationCasesService: AttestationCasesService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly busyService: EuiLoadingService,
    private readonly translate: TranslateService,
    private readonly snackBar: SnackBarService,
    private readonly entityService: EntityService,
    private readonly action: AttestationActionService
  ) { }

  public canDecide(
    attestationCase: {
      DecisionLevel: IReadValue<number>;
      UID_QERWorkingMethod: IReadValue<string>;
      data: AttestationCaseData;
    },
    userUid: string
  ): boolean {
    const approverContainer = new ApproverContainer(
      {
        decisionLevel: attestationCase.DecisionLevel.value,
        qerWorkingMethod: attestationCase.UID_QERWorkingMethod.value,
        pwoData: attestationCase.data,
        approvers: [userUid]
      }
    );

    return approverContainer.approverNow?.length > 0;
  }

  public async approve(attestationCases: AttestationCaseAction[]): Promise<void> {
    await this.action.approve(attestationCases);
    this.applied.next();
  }

  public async deny(attestationCases: AttestationCaseAction[]): Promise<void> {
    await this.action.deny(attestationCases);
    this.applied.next();
  }

  public async revokeAdditional(attestationCases: PortalAttestationCase[]): Promise<void> {
    const actionParameters = {
      reason: this.createCdrReason({ mandatory: true })
    };

    return this.editAction({
      title: '#LDS#Heading Withdraw Additional Attestor',
      data: { attestationCases, actionParameters },
      message: '#LDS#The additional attestors of {0} attestation cases have been successfully withdrawn.',
      apply: (attestationCase: PortalAttestationCase) => this.attestationCasesService.revokeDelegation(attestationCase, {
        Reason: actionParameters.reason.column.GetValue()
      })
    });
  }

  public async recallDecision(attestationCases: PortalAttestationCase[]): Promise<void> {
    const actionParameters = {
      reason: this.createCdrReason({ mandatory: true })
    };

    return this.editAction({
      title: '#LDS#Heading Undo Approval Decision',
      data: { attestationCases, actionParameters },
      message: '#LDS#{0} approval decisions have been successfully undone.',
      apply: (attestationCase: PortalAttestationCase) => this.attestationCasesService.recallDecision(attestationCase, {
        Reason: actionParameters.reason.column.GetValue()
      })
    });
  }

  private async editAction(config: any): Promise<void> {
    const result = await this.sidesheet.open(AttestationActionComponent, {
      title: await this.translate.get(config.title).toPromise(),
      subTitle: config.data.attestationCases.length === 1 ? config.data.attestationCases[0].GetEntity().GetDisplay() : '' ,
      panelClass: 'imx-sidesheet',
      padding: '0',
      width: '600px',
      testId: 'attestation-action-sidesheet',
      data: config.data
    }).afterClosed().toPromise();

    if (result) {
      let busyIndicator: OverlayRef;
      setTimeout(() => busyIndicator = this.busyService.show());

      try {
        for (const attestationCase of config.data.attestationCases) {
          await config.apply(attestationCase);
        }
      } finally {
        setTimeout(() => this.busyService.hide(busyIndicator));
        this.snackBar.open({ key: config.message, parameters: [config.data.attestationCases.length] });
      }

      this.applied.next();
    } else {
      this.snackBar.open({ key: '#LDS#You have canceled the action.' });
    }
  }

  private createCdrReason(metadata: { display?: string, mandatory?: boolean } = {}): ColumnDependentReference {
    return new BaseCdr(
      this.entityService.createLocalEntityColumn({
        ColumnName: 'ReasonHead',
        Type: ValType.Text,
        IsMultiLine: true,
        MinLen: metadata.mandatory ? 1 : 0
      }),
      metadata.display || '#LDS#Reason for your decision'
    );
  }
}
