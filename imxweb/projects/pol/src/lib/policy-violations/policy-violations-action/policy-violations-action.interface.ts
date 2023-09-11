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

import { PolicyViolation } from '../policy-violation';
import { PolicyViolationsActionParameters } from './policy-violations-action-parameters.interface';

/**
 * Common View Model for making a decision for one or more policy violations.
 */
export interface PolicyViolationsAction {
  /**
   * Parameters according to the type of decision.
   */
  actionParameters: PolicyViolationsActionParameters;

  /**
   * The policy violations to make a decision for.
   */
  policyViolations: PolicyViolation[];

  /**
   * Whether or not the decision is an approval.
   */
  approve?: boolean;

  /**
   * A description for the type of decision to be made.
   */
  description?: string;
}
