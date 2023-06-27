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

import { Injectable } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';
import { PortalShopServiceitems, ServiceItemHierarchy } from 'imx-api-qer';
import { EntitySchema, IWriteValue, MultiValue, TypedEntity } from 'imx-qbm-dbts';
import { QerApiService } from '../../qer-api-client.service';
import { ServiceItemHierarchyExtended, ServiceItemTreeWrapper } from '../service-item-order.interface';

@Injectable({
  providedIn: 'root',
})
export class DependencyService {
  constructor(private readonly qerClient: QerApiService, private busyService: EuiLoadingService) {}

  public get PortalShopServiceItemsSchema(): EntitySchema {
    return this.qerClient.typedClient.PortalShopServiceitems.GetSchema();
  }

  public async get(parameters: { UID_Person?: string; UID_AccProductParent: string }): Promise<ServiceItemHierarchy> {
    return this.qerClient.v2Client.portal_shop_serviceitems_dependencies_get(parameters.UID_AccProductParent, {
      UID_Person: parameters?.UID_Person,
    });
  }

  public countOptional(tree: ServiceItemHierarchy): number {
    let count = 0;
    if (tree?.Optional.length > 0) {
      // Count number of optional, and apply this to all children
      count += tree.Optional.length;
      count = tree.Optional.map((childTree) => this.countOptional(childTree)).reduce((a, b) => a + b, count);
    }
    if (tree?.Mandatory.length > 0) {
      // Apply only to children
      count = tree.Mandatory.map((childTree) => this.countOptional(childTree)).reduce((a, b) => a + b, count);
    }
    return count;
  }

  public extendTree(
    tree: ServiceItemHierarchy,
    options?: {
      Recipients?: string[];
      UidRecipients?: string[];
      isMandatory: boolean;
      isChecked: boolean;
      isIndeterminate: boolean;
      parentChecked: boolean;
      parentUid?: string;
    }
  ): ServiceItemHierarchyExtended {
    const extendedTree: ServiceItemHierarchyExtended = {
      Display: tree.Display,
      UidAccProduct: tree.UidAccProduct,
      Mandatory: [],
      Optional: [],
      ...options,
    };
    const parentUid = tree.UidAccProduct;
    if (tree?.Mandatory.length > 0) {
      extendedTree.Mandatory = tree.Mandatory.map((childTree) =>
        this.extendTree(childTree, {
          isMandatory: true,
          isChecked: true,
          isIndeterminate: !(options.isChecked && options.parentChecked),
          parentUid,
          parentChecked: options.isChecked,
        })
      );
    }
    if (tree?.Optional.length > 0) {
      extendedTree.Optional = tree.Optional.map((childTree) =>
        this.extendTree(childTree, {
          isMandatory: false,
          isChecked: false,
          isIndeterminate: !(options.isChecked && options.parentChecked),
          parentUid,
          parentChecked: options.isChecked,
        })
      );
    }
    return extendedTree;
  }

  public async checkForOptionalTree(
    serviceItems: PortalShopServiceitems[],
    recipients: IWriteValue<string>
  ): Promise<ServiceItemTreeWrapper> {
    const allTrees: ServiceItemTreeWrapper = {
      trees: [],
    };
    try {
      this.busyService.show();
      let optionalCount = 0;
      const uidRecipients = MultiValue.FromString(recipients.value).GetValues();
      const displayRecipients = MultiValue.FromString(recipients.Column.GetDisplayValue()).GetValues();
      await Promise.all(
        serviceItems.map(async (parentItem) => {
          const parentKey = this.getKey(parentItem);
          const hierarchy = await this.get({
            UID_AccProductParent: parentKey,
            UID_Person: uidRecipients.join(','),
          });
          const thisCount = this.countOptional(hierarchy);
          if (thisCount > 0) {
            const extendedhierarchy = this.extendTree(hierarchy, {
              Recipients: displayRecipients,
              UidRecipients: uidRecipients,
              isMandatory: true,
              isChecked: true,
              isIndeterminate: false,
              parentChecked: true,
            });
            allTrees.trees.push(extendedhierarchy);
            optionalCount += thisCount;
          }
        })
      );
      allTrees.totalOptional = optionalCount;
    } finally {
      this.busyService.hide();
    }
    return allTrees;
  }

  private getKey(item: TypedEntity): string {
    return item.GetEntity().GetKeys()[0];
  }
}
