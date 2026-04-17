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

import { Injectable } from '@angular/core';

import { PortalAttestationCase } from '@imx-modules/imx-api-att';
import { CollectionLoadParameters, ExtendedTypedEntityCollection } from '@imx-modules/imx-qbm-dbts';
import { AttestationHistoryCase } from '../../attestation-history/attestation-history-case';
import { AttestationHistoryService } from '../../attestation-history/attestation-history.service';

@Injectable({
  providedIn: 'root',
})
export class AttestationCaseHistoryService {
  constructor(private attestationHistoryService: AttestationHistoryService) {}

  /**
   * Gets attestation cases for the given attestation case's policy and object key, excluding the given attestation case itself
   * @param state The collection load parameters
   */
  public async getAttestationCasesForDecision(
    state: CollectionLoadParameters,
    attestationCase: PortalAttestationCase,
  ): Promise<ExtendedTypedEntityCollection<AttestationHistoryCase, unknown>> {
    const newState = {
      ...state,
      filter: [
        {
          Type: 2,
          Expression: {
            Expressions: [
              {
                PropertyId: 'UID_AttestationPolicy',
                Operator: '=',
                LogOperator: 0,
                Value: attestationCase.GetEntity().GetColumn('UID_AttestationPolicy').GetValue(),
                Negate: false,
              },
              {
                PropertyId: 'ObjectKeyBase',
                Operator: '=',
                LogOperator: 0,
                Value: attestationCase.GetEntity().GetColumn('ObjectKeyBase').GetValue(),
                Negate: false,
              },
              {
                PropertyId: 'UID_AttestationCase',
                Operator: '<>',
                LogOperator: 0,
                Value: attestationCase.GetEntity().GetKeys()[0],
                Negate: false,
              },
            ],
            LogOperator: 0,
            Negate: false,
          },
        },
      ],
    };
    return this.attestationHistoryService.getAttestations(newState);
  }
}
