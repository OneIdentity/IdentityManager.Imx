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

import { AttestationCaseUiData } from 'imx-api-att';
import { IEntity, IEntityColumn, TypedEntity } from 'imx-qbm-dbts';

export interface AttestationCaseAction {
  /**
   * The entity, that is used by the bulk editor
   */
  typedEntity: TypedEntity;

  /**
   * a Property for storing the extended Data
   */
  data: any;

  uiData?: AttestationCaseUiData;

  /**
   * Properties, that are used to build special bulk item editors
   */
  propertiesForAction: IEntityColumn[];

  /**
   * the parameter columns for the attestation object (history or approve)
   */
  attestationParameters: IEntityColumn[];

  /**
   * The key, that identifies the object
   */
  key: string;

  /**
   * Method, that might update the direct decision target 
   */
  updateDirectDecisionTarget?: (workflow: IEntity) => void;  // used for rerouting
}
