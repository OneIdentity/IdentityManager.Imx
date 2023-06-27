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
 * Copyright 2022 One Identity LLC.
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

import { PortalShopServiceitems, RequestableProductForPerson } from 'imx-api-qer';

export interface ServiceItemOrder {
  /**
   * Service items apart of order
   */
  serviceItems?: PortalShopServiceitems[];

  /**
   * Any items-turned-requestable product apart of order
   */
  requestables?: RequestableProductForPerson[];
}

export interface ServiceItemTreeWrapper {
  /**
   * Array of trees to appear in treeview of the optional sidesheet
   */
  trees?: ServiceItemHierarchyExtended[];

  /**
   * Stored count of optional items in all trees
   */
  totalOptional?: number;
}

export interface ServiceItemHierarchyExtended {
  /**
   * Display for this leaf
   */
  Display: string;

  /**
   * Uid for this leaf
   */
  UidAccProduct: string;

  /**
   * Any nested optional items under this leaf
   */
  Optional?: ServiceItemHierarchyExtended[];

  /**
   * Any nested mandatory items under this leaf
   */
  Mandatory?: ServiceItemHierarchyExtended[];

  /**
   * Recipient strings for this leaf (only appears in base of tree)
   */
  Recipients?: string[];

  /**
   * Recipient uids for this leaf (only appears in base of tree)
   */
  UidRecipients?: string[];

  /**
   * is this leaf mandatory (coupled to UI)
   */
  isMandatory: boolean;

  /**
   * is this leaf checked? (coupled to UI)
   */
  isChecked: boolean;

  /**
   * Is this leaf in an indeterminate state (parent unchecked/indeterminate, coupled to UI)
   */
  isIndeterminate: boolean;

  /**
   * Is parent checked
   */
  parentChecked: boolean;

  /**
   * parent uid
   */
  parentUid?: string;
}
