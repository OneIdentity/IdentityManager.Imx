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

import { Injectable } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { PortalAttestationApprove } from 'imx-api-att';
import { IEntityColumn, ValType } from 'imx-qbm-dbts';
import { SnackBarService, EntityService, ColumnDependentReference, BaseCdr } from 'qbm';
import { JustificationService, JustificationType, PersonService } from 'qer';
import { AttestationCasesService } from '../decision/attestation-cases.service';
import { AttestationActionComponent } from './attestation-action.component';
import { AttestationCase } from '../decision/attestation-case';
import { AttestationWorkflowService } from './attestation-workflow.service';
import { AttestationCaseAction } from './attestation-case-action.interface';

@Injectable({
  providedIn: 'root'
})
export class AttestationActionService {
  public readonly applied = new Subject();

  constructor(
    private readonly justification: JustificationService,
    private readonly attestationCases: AttestationCasesService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly busyService: EuiLoadingService,
    private readonly translate: TranslateService,
    private readonly snackBar: SnackBarService,
    private readonly entityService: EntityService,
    private readonly person: PersonService,
    private readonly workflow: AttestationWorkflowService
  ) { }

  public async directDecision(attestationCases: AttestationCase[], userUid: string): Promise<void> {
    const actionParameters = {
      reason: this.createCdrReason()
    };

    const workflow = {
      title: '#LDS#Approval level',
      placeholder: '#LDS#Select approval level',
      data: {}
    };

    let busyIndicator: OverlayRef;
    setTimeout(() => busyIndicator = this.busyService.show());

    try {
      for (const attestationCase of attestationCases) {
        const levelNumbers = attestationCase.getLevelNumbers(userUid);
        workflow.data[attestationCase.key] =
          (await this.workflow.get(attestationCase.key)).Data
            .filter(item => levelNumbers.includes(item.LevelNumber.value))
            .filter((item, index, array) => array.map(mapObj => mapObj.LevelNumber.value).indexOf(item.LevelNumber.value) === index)
            .map(item => item.GetEntity());
      }
    } finally {
      setTimeout(() => this.busyService.hide(busyIndicator));
    }

    return this.editAction({
      title: '#LDS#Heading Reroute Approval',
      data: { attestationCases, actionParameters, workflow },
      message: '#LDS#{0} approvals have been successfully rerouted.',
      apply: (attestationCase: AttestationCase) => this.attestationCases.directDecision(attestationCase, {
        Reason: actionParameters.reason.column.GetValue(),
        Offset: attestationCase.decisionOffset
      })
    });
  }

  public async addAdditionalAttestor(attestationCases: PortalAttestationApprove[]): Promise<void> {
    const actionParameters = {
      reason: this.createCdrReason({ mandatory: true }),
      person: this.createCdrPerson('#LDS#Additional attestor')
    };

    return this.editAction({
      title: '#LDS#Heading Add Additional Attestor',
      data: { attestationCases, actionParameters, description: '#LDS#Specify an additional attestor' },
      getMessage: () => ({
        key: '#LDS#"{1}" has been successfully added as additional attestor for {0} attestation cases.',
        parameters: [attestationCases.length, actionParameters.person.column.GetDisplayValue()]
      }),
      apply: (attestationCase: PortalAttestationApprove) => this.attestationCases.addAdditional(attestationCase, {
        Reason: actionParameters.reason.column.GetValue(),
        UidPerson: actionParameters.person.column.GetValue()
      })
    });
  }

  public async delegateDecision(attestationCases: PortalAttestationApprove[]): Promise<void> {
    const actionParameters = {
      reason: this.createCdrReason({ mandatory: true }),
      person: this.createCdrPerson('#LDS#Delegate to')
    };

    return this.editAction({
      title: '#LDS#Heading Delegate Approval',
      data: { attestationCases, actionParameters, description: '#LDS#Specify an identity who should decide instead' },
      getMessage: () => ({
        key: '#LDS#{0} approvals have been successfully delegated to "{1}".',
        parameters: [attestationCases.length, actionParameters.person.column.GetDisplayValue()]
      }),
      apply: (attestationCase: PortalAttestationApprove) => this.attestationCases.addInsteadOf(attestationCase, {
        Reason: actionParameters.reason.column.GetValue(),
        UidPerson: actionParameters.person.column.GetValue()
      })
    });
  }

  public async escalateDecisions(attestationCases: PortalAttestationApprove[]): Promise<void> {
    const actionParameters = {
      reason: this.createCdrReason({ mandatory: true })
    };

    return this.editAction({
      title: '#LDS#Heading Escalate Approval',
      data: { attestationCases, actionParameters },
      getMessage: () => ({
        key: '#LDS#{0} approvals have been successfully escalated.',
        parameters: [attestationCases.length]
      }),
      apply: (attestationCase: PortalAttestationApprove) =>
        this.attestationCases.escalateDecision(attestationCase, {Reason: actionParameters.reason.column.GetValue()})
    });
  }

  public async revokeDelegation(attestationCases: PortalAttestationApprove[]): Promise<void> {
    const actionParameters = {
      reason: this.createCdrReason({ mandatory: true })
    };

    return this.editAction({
      title: '#LDS#Heading Withdraw Additional Attestor',
      data: { attestationCases, actionParameters },
      message: '#LDS#The additional attestors of {0} attestation cases have been successfully withdrawn.',
      apply: (attestationCase: PortalAttestationApprove) => this.attestationCases.revokeDelegation(attestationCase, {
        Reason: actionParameters.reason.column.GetValue()
      })
    });
  }

  public async denyDecisions(attestationCases: PortalAttestationApprove[]): Promise<void> {
    const actionParameters = {
      reason: this.createCdrReason({ mandatory: true })
    };

    return this.editAction({
      title: '#LDS#Heading Reject Approval',
      data: { attestationCases, actionParameters },
      message: '#LDS#{0} approvals have been successfully rejected.',
      apply: (attestationCase: PortalAttestationApprove) => this.attestationCases.denyDecision(attestationCase, {
        Reason: actionParameters.reason.column.GetValue()
      })
    });
  }

  public async checkForViolations(attestationCases: AttestationCase[]): Promise<void> {
    let isApprovable = true;
    for (const attestationCase of attestationCases) {
      const isAllAllowable = attestationCase.data.ComplianceViolations.every(item => item.IsExceptionAllowed);
      if (!isAllAllowable) {
        // Found a case that has an unexceptional violation, break early
        isApprovable = false;
        break;
      }
    }

    if (isApprovable) {
      return this.approve(attestationCases);
    } else {
      let message: string;
      if (attestationCases.length === 1) {
        // Special case length one
        message = '#LDS#You cannot approve this attestation case. There are rule violations for the attestation case for which no exceptions may be granted.';
      } else {
        message = '#LDS#You cannot approve these attestation cases. There are rule violations for at least one attestation case for which no exceptions may be granted.';
      }
      this.snackBar.open({key: message});
    }
  }

  public async approve(attestationCases: AttestationCaseAction[]): Promise<void> {
    return this.makeDecisions(attestationCases, true);
  }

  public async deny(attestationCases: AttestationCaseAction[]): Promise<void> {
    // TODO later: preview effects of auto-remove before making negative decision (ATT_AttestationCase_PreviewAutoRemove)
    return this.makeDecisions(attestationCases, false);
  }

  public createCdrReason(metadata: { display?: string, mandatory?: boolean } = {}): ColumnDependentReference {
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

  private async makeDecisions(attestationCases: AttestationCaseAction[], approve: boolean): Promise<void> {
    let justification: ColumnDependentReference;

    let busyIndicator: OverlayRef;
    setTimeout(() => busyIndicator = this.busyService.show());

    try {
      justification = await this.justification.createCdr(
        approve ? JustificationType.approveAttestation : JustificationType.denyAttestation
      );
    } finally {
      setTimeout(() => this.busyService.hide(busyIndicator));
    }

    const actionParameters = {
      justification,
      reason: this.createCdrReason({ display: justification ? '#LDS#Additional comments about your decision' : undefined })
    };

    return this.editAction({
      title: approve ? '#LDS#Heading Approve Attestation Case' : '#LDS#Heading Deny Attestation Case',
      headerColour: approve ? 'aspen-green' : 'corbin-orange',
      data: { attestationCases, actionParameters, approve },
      message: approve ? '#LDS#{0} attestation cases have been successfully approved.'
        : '#LDS#{0} attestation cases have been successfully denied.',
      apply: async (attestationCase: AttestationCase) => {
        if (approve) {
          await attestationCase.commit(false /* avoid expensive reload */);
        }
        return this.attestationCases.makeDecision(attestationCase, {
          Reason: actionParameters.reason.column.GetValue(),
          UidJustification: actionParameters.justification?.column?.GetValue(),
          Decision: approve
        });
      }
    });
  }

  private async editAction(config: any): Promise<void> {
    const result = await this.sidesheet.open(AttestationActionComponent, {
      title: await this.translate.get(config.title).toPromise(),
      headerColour: config.headerColour ?? 'iris-blue',
      panelClass: 'imx-sidesheet',
      padding: '0',
      width: '600px',
      testId: 'attestation-action-sidesheet',
      data: config.data
    }).afterClosed().toPromise();

    if (result) {
      let busyIndicator: OverlayRef;
      setTimeout(() => busyIndicator = this.busyService.show());

      let success: boolean;
      try {
        for (const attestationCase of config.data.attestationCases) {
          await config.apply(attestationCase);
        }
        success = true;
      } finally {
        setTimeout(() => this.busyService.hide(busyIndicator));
      }

      if (success) {
        this.snackBar.open(config.getMessage ?
          config.getMessage() :
          { key: config.message, parameters: [config.data.attestationCases.length] }
        );
        this.applied.next();
      }
    } else {
      this.snackBar.open({ key: '#LDS#You have canceled the action.' });
    }
  }

  private createCdrPerson(display?: string): ColumnDependentReference {
    const fkRelation = {
      ChildColumnName: 'UID_PersonRelated',
      ParentTableName: 'Person',
      ParentColumnName: 'UID_Person',
      IsMemberRelation: false
    };

    return new BaseCdr(
      this.entityService.createLocalEntityColumn(
        {
          ColumnName: fkRelation.ChildColumnName,
          Type: ValType.String,
          FkRelation: fkRelation,
          IsValidColumnForFiltering: true,
          MinLen: 1
        },
        [this.person.createFkProviderItem(fkRelation)]
      ),
      display || '#LDS#Identity'
    );
  }
}
