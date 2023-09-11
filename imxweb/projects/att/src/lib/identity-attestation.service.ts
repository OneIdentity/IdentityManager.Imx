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

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { CompareOperator, FilterType } from 'imx-qbm-dbts';
import { AttestationHistoryService } from './attestation-history/attestation-history.service';
import { AttestationCasesService } from './decision/attestation-cases.service';
import { AttestationHistoryActionService } from './attestation-history/attestation-history-action.service';
import { AttestationCaseLoadParameters } from './attestation-history/attestation-case-load-parameters.interface';
import { ObjectAttestationStatistics } from 'qer';

@Injectable({
  providedIn: 'root'
})
export class IdentityAttestationService {
  public get applied(): Subject<any> { return this.attestationAction.applied; }

  constructor(
    private readonly attestationHistory: AttestationHistoryService,
    private readonly attestationApprove: AttestationCasesService,
    private readonly attestationAction: AttestationHistoryActionService
  ) { }

  public async getNumberOfPendingForUser(parameters: AttestationCaseLoadParameters): Promise<ObjectAttestationStatistics> {
    const attestations = await this.attestationHistory.get({
      ...parameters,
      ...{ PageSize: -1 }
    });

    const filter = [{
      ColumnName: 'IsClosed',
      Type: FilterType.Compare,
      CompareOp: CompareOperator.Equal,
      Value1: 0
    }];

    const pendingAttestations = await this.attestationHistory.get({
      ...parameters,
      ...{ filter },
      ...{ PageSize: -1 }
    });

    return {
      total: attestations?.totalCount ?? 0,
      pendingTotal: pendingAttestations?.totalCount ?? 0,
      pendingForUser: await this.attestationApprove.getNumberOfPending(parameters)
    };
  }
}
