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

import { CollectionLoadParameters, EntitySchema, EntityCollectionData } from 'imx-qbm-dbts';

export interface IdentityRoleMembershipsParameter {
  /**
   * the tableName for the specific role type
   */
  table: string;

  /**
   * a method, that provides the collection data
   */
  get?: (uidPerson: string, navigationState?: CollectionLoadParameters) => Promise<EntityCollectionData>;

  /**
   * the data type used for typed entity building
   */
  type?: any;

  /**
   * provides information for the tab control
   */
  controlInfo?: MembershipContolInfo;

  /**
   * the entity schema for the type
   */
  entitySchema?: EntitySchema;

  /**
   * True, if the control should render a button for analysis else false
   */
  withAnalysis?: boolean;
}

export interface MembershipContolInfo {
  label: string;
  index: number;
}
