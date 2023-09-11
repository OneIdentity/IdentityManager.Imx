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

import { Injectable } from '@angular/core';

import { ClassloggerService } from 'qbm';
import { PortalServiceitemsTags } from 'imx-api-qer';
import { CollectionLoadParameters, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { QerApiService } from '../qer-api-client.service';


@Injectable({
  providedIn: 'root'
})
/**
 * Provides methods to load, add and remove tags
 */
export class ServiceItemTagsService {
  constructor(private readonly apiClient: QerApiService, private logger: ClassloggerService) { }

  /**
   * Gets all tags associated with the accProduct of an entitlement
   * @param entitlement the entitlement the tags belpong to
   * @param parameters additional load parameter
   */
  public async getTags(uidAccProduct: string, parameters?: CollectionLoadParameters):
    Promise<TypedEntityCollectionData<PortalServiceitemsTags>> {
    return this.apiClient.typedClient.PortalServiceitemsTags.Get(uidAccProduct, parameters);
  }

  /**
   * Updates the tags associated with the accProduct of an entitlement
   * @param entitlement the entitlement the tags belong to
   * @param tagsAdd tags for adding
   * @param tagsRemove tags for removing
   */
  public async updateTags(uidAccProduct: string, tagsAdd: string[], tagsRemove: string[]): Promise<void> {
    const assignedTags = await this.getTags(uidAccProduct);

    await this.deleteTags(uidAccProduct, assignedTags.Data.filter(shop => ServiceItemTagsService.isForDeletion(shop, tagsRemove)));

    return this.addTags(uidAccProduct, tagsAdd.filter(shop => !ServiceItemTagsService.isAssigned(shop, assignedTags.Data)));
  }

  private async addTags(uidAccProduct: string, tags: string[]): Promise<void> {
    for (const tag of tags) {
      this.logger.trace(this, `add tag: ${tag} for uid ${uidAccProduct}`);
      await this.apiClient.client.
      portal_serviceitems_tags_add_post(uidAccProduct, tag);
    }
  }

  private async deleteTags(uidAccProduct: string, items: PortalServiceitemsTags[]): Promise<void> {
    for (const tag of items) {
      this.logger.trace(this, `remove tag: ${tag.Ident_DialogTag} for uid ${uidAccProduct}`);
      await this.apiClient.client.
      portal_serviceitems_tags_delete(uidAccProduct, tag.GetEntity().GetKeys()[0]);
    }
  }

  /**
   * Checks if a tag is assigned
   * @param tag the tag, that should be checked
   * @param tagsAssigned a list of tags that are already assigned
   */
  public static isAssigned(tag: string, tagsAssigned: PortalServiceitemsTags[]): boolean {
    return tagsAssigned && tagsAssigned.find(shopAssigned => shopAssigned.Ident_DialogTag.value === tag) != null;
  }

  /**
   * checks if a tag item is part of the deletion list
   * @param tagItem the tag item, that should be checked
   * @param tagsForDeletion a list of tags, hat should be deleted
   */
  public static isForDeletion(tagItem: PortalServiceitemsTags, tagsForDeletion: string[]): boolean {
    return tagsForDeletion && tagsForDeletion.find(shopElement => tagItem.Ident_DialogTag.value === shopElement) != null;
  }
}
