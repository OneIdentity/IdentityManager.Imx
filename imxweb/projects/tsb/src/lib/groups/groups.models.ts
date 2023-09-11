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

import { CollectionLoadParameters } from 'imx-qbm-dbts';
import { PortalTargetsystemUnsGroupServiceitem } from 'imx-api-tsb';
import { GroupTypedEntity } from './group-typed-entity';
import { DbObjectKeyBase } from '../target-system/db-object-key-wrapper.interface';

export interface GetGroupsOptionalParameters extends CollectionLoadParameters {
  uid_unsaccount?: string;
  published?: string;
  withowner?: string;
  system?: string;
  container?: string;
}

export interface GroupSidesheetData {
  uidAccProduct: string;
  unsGroupDbObjectKey: DbObjectKeyBase;
  group: GroupTypedEntity;
  groupServiceItem: PortalTargetsystemUnsGroupServiceitem;
  isAdmin?: boolean;
}

export interface GroupsFilterTreeParameters {
  container: string;
  system: string;
  uid_unsaccount: string;
  parentkey:string;
}
