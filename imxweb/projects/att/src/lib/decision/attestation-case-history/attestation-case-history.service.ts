import { Injectable } from '@angular/core';

import { PortalAttestationCase } from '@imx-modules/imx-api-att';
import {
  CollectionLoadParameters,
  ExtendedTypedEntityCollection,
} from '@imx-modules/imx-qbm-dbts';
import { AttestationHistoryCase } from '../../attestation-history/attestation-history-case';
import { AttestationHistoryService } from '../../attestation-history/attestation-history.service';

@Injectable({
  providedIn: 'root',
})
export class AttestationCaseHistoryService {
  constructor(private attestationHistoryService: AttestationHistoryService) { }

  /**
   * Gets attestation cases for the given attestation case's policy and object key, excluding the given attestation case itself
   * @param state The collection load parameters
   */
  public async getAttestationCasesForDecision(
    state: CollectionLoadParameters,
    attestationCase: PortalAttestationCase
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
