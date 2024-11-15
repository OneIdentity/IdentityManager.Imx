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

import {
  CollectionLoadParameters,
  EntityCollectionData,
  EntitySchema,
  ExtendedTypedEntityCollection,
  TypedEntity,
} from '@imx-modules/imx-qbm-dbts';
import { ImxTranslationProviderService, imx_SessionService } from 'qbm';
import { BaseMembership } from 'qer';
import { RmsApiService } from './rms-api-client.service';

export class EsetMembership extends BaseMembership {
  public supportsDynamicMemberships = false;

  constructor(
    private readonly api: RmsApiService,
    private readonly session: imx_SessionService,
    private readonly translator: ImxTranslationProviderService,
  ) {
    super(api, session, translator);
    this.setRoleName('ESet', 'UID_ESet');
  }

  public async delete(role: string, identity: string): Promise<EntityCollectionData> {
    return this.api.client.portal_roles_config_membership_ESet_delete(role, identity);
  }

  public hasPrimaryMemberships(): boolean {
    return false;
  }

  public getPrimaryMembers(
    uid: string,
    navigationstate: CollectionLoadParameters,
  ): Promise<ExtendedTypedEntityCollection<TypedEntity, any>> {
    throw new Error('System roles do not allow primary memberships.');
  }

  public getPrimaryMembersSchema(): EntitySchema {
    throw new Error('System roles do not allow primary memberships.');
  }
}
