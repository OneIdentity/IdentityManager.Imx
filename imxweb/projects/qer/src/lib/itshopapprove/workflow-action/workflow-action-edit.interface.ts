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

import { EntitySchema, IClientProperty, IEntity } from 'imx-qbm-dbts';
import { ColumnDependentReference } from 'qbm';
import { Approval } from '../approval';
import { WorkflowActionParameters } from './workflow-action-parameters.interface';

/**
 * Common View Model for making a decision for one or more requests.
 */
export interface WorkflowActionEdit {
  /**
   * Parameters according to the type of decision.
   */
  actionParameters: WorkflowActionParameters;

  /**Additional information, that should be shown on the sidesheet */
  additionalInfo?: ColumnDependentReference[];

  /**
   * The requests to make a decision for.
   */
  requests: Approval[];

  /**
   * Whether or not the decision is an approval.
   */
  approve?: boolean;

  /**
   * A description for the type of decision to be made.
   */
  description?: string;

  /**
   * Whether or not the decision shows the decision guidance tab
   */
  withGuidance?:boolean;


  /**
   * Information about the workflow so far.
   */
  workflow?: {
    entitySchema: EntitySchema,
    display: { primary: IClientProperty, secondary?: IClientProperty },
    data: { [key: string]: IEntity[] },
    title: string,
    placeholder: string
  };

  /**
   * General information whether to show valid from and/or valid until fields for ALL requests.
   *
   * If given and specified these values are meant to be applied to all requests where such a value can be applied.
   */
  showValidDate?: {
    validFrom?: { key: string, placeholder: string };
    validUntil?: { key: string, placeholder: string };
  };

  /**
   * A custom validation method for all of the settings made.
   */
  customValidation?: {
    validate: () => boolean;
    message: string
  };
}
