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

import { RoleExtendedDataWrite } from 'imx-api-qer';
import { CollectionLoadParameters, EntitySchema, ExtendedTypedEntityCollection, WriteExtTypedEntity } from 'imx-qbm-dbts';
import { DataSourceToolbarExportMethod } from 'qbm';
import { IRoleRestoreHandler } from './restore/restore-handler';
import { IRoleDataModel } from './role-data-model.interface';
import { IRoleEntitlements } from './role-entitlements/entitlement-handlers';
import { IRoleMembershipType } from './role-memberships/membership-handlers';

type InteractiveEntityType = {
  GetSchema(): EntitySchema;
  Get_byid(id: string): Promise<ExtendedTypedEntityCollection<WriteExtTypedEntity<RoleExtendedDataWrite>, unknown>>;
  Get(): Promise<ExtendedTypedEntityCollection<WriteExtTypedEntity<RoleExtendedDataWrite>, unknown>>;
};

export interface RoleTranslateKeys {
  create?: string;
  createChild?: string;
  createHeading?: string;
  editHeading?: string;
  createSnackbar?: string;
}

export interface RoleObjectInfo {
  table: string;

  /** Returns a flag indicating whether roles of this type can be split. */
  canBeSplitSource: boolean;

  /** Returns a flag indicating whether roles of this type can be created by splitting an existing role. */
  canBeSplitTarget: boolean;

  /**Returns a flag indicating whether roles of this type can have statistics */
  canHaveStatistics?: boolean;

  restore?: IRoleRestoreHandler;

  respType?: any;
  adminType?: any;
  resp?: any;
  admin?: any;
  adminSchema?: EntitySchema;
  adminHasHierarchy?:boolean;
  respHasHierarchiy?: boolean;
  dataModel?: IRoleDataModel;
  adminCanCreate?: boolean;
  respCanCreate?: boolean;
  interactiveResp?: InteractiveEntityType;
  interactiveAdmin?: InteractiveEntityType;
  entitlements?: IRoleEntitlements;
  membership?: IRoleMembershipType;
  canUseRecommendations?: boolean;
  translateKeys?: RoleTranslateKeys;
  exportMethod?: (navigationState: CollectionLoadParameters, isAdmin: boolean) => DataSourceToolbarExportMethod
}
