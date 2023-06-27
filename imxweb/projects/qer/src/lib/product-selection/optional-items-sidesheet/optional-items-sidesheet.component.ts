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

import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { PortalShopServiceitems, QerProjectConfig } from 'imx-api-qer';
import { MultiValue } from 'imx-qbm-dbts';
import { ConfirmationService } from 'qbm';
import { Subscription } from 'rxjs';
import { ServiceItemsService } from '../../service-items/service-items.service';
import { ServiceItemHierarchyExtended, ServiceItemOrder, ServiceItemTreeWrapper } from '../service-item-order.interface';

@Component({
  selector: 'imx-optional-items-sidesheet',
  templateUrl: './optional-items-sidesheet.component.html',
  styleUrls: ['./optional-items-sidesheet.component.scss'],
})
export class OptionalItemsSidesheetComponent implements OnInit, OnDestroy {
  public nRecipientsText: string = '';
  public baseItems: PortalShopServiceitems[];
  public optionalItems: PortalShopServiceitems[];
  public treeControl = new NestedTreeControl<ServiceItemHierarchyExtended>((leaf) => {
    return Array.prototype.concat(leaf.Mandatory, leaf.Optional);
  });
  public dataSource = new MatTreeNestedDataSource<ServiceItemHierarchyExtended>();
  public selected = 0;
  public totalLeaves = 0;

  private initialState: { isChecked: boolean; isIndeterminate: boolean; parentChecked: boolean }[] = [];
  private optionalItemMap: {
    [key: string]: Promise<PortalShopServiceitems>;
  } = {};
  private subscriptions: Subscription[] = [];

  constructor(
    private busyService: EuiLoadingService,
    private serviceItemsProvider: ServiceItemsService,
    private readonly sideSheetRef: EuiSidesheetRef,
    private confirmationService: ConfirmationService,
    private translate: TranslateService,
    @Inject(EUI_SIDESHEET_DATA)
    public data: {
      serviceItemTree: ServiceItemTreeWrapper;
      projectConfig: QerProjectConfig;
    }
  ) {
    this.dataSource.data = this.data.serviceItemTree.trees;
    this.treeControl.dataNodes = this.dataSource.data;

    this.subscriptions.push(
      this.sideSheetRef.closeClicked().subscribe(async () => {
        if (
          await this.confirmationService.confirm({
            Title: '#LDS#Heading Cancel Request Process',
            Message: '#LDS#Are you sure you want to cancel the request process and not add the products to your shopping cart?',
          })
        ) {
          this.sideSheetRef.close();
        }
      })
    );
  }

  public hasChild = (_: number, tree: ServiceItemHierarchyExtended) =>
    (!!tree.Mandatory && tree.Mandatory.length > 0) || (!!tree.Optional && tree.Optional.length > 0);

  public ngOnInit(): void {
    this.nRecipientsText = this.translate.instant('{0} recipients selected');
    this.treeControl.dataNodes.forEach((tree) => {
      this.treeControl.getDescendants(tree).forEach((child) => {
        if (!child.isMandatory) {
          // If this is an optional node, add it to the total
          this.totalLeaves += 1;
        }
        this.initialState.push({
          isChecked: child.isChecked,
          isIndeterminate: child.isIndeterminate,
          parentChecked: child.parentChecked,
        });
        if (!child.isMandatory && !this.optionalItemMap[child.UidAccProduct]) {
          this.optionalItemMap[child.UidAccProduct] = this.serviceItemsProvider.getServiceItem(child.UidAccProduct);
        }
      });
    });
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public getRecipientText(node: ServiceItemHierarchyExtended): string {
    return this.nRecipientsText.slice().replace('{0}', node.Recipients.length.toString());
  }

  public getKey(item: PortalShopServiceitems): string {
    return item.GetEntity().GetKeys()[0];
  }

  public async addToCart(): Promise<void> {
    this.busyService.show();
    try {
      // Make sure all items have been grabbed
      await Promise.all(Object.values(this.optionalItemMap));
    } finally {
      this.busyService.hide();
    }
    const outgoingServiceOrder: ServiceItemOrder = {
      requestables: [],
    };

    this.treeControl.dataNodes.forEach((tree) => {
      // Loop over each service item tree
      tree.UidRecipients.forEach((uidRecipient, index) => {
        // Loop over each recipient
        const recipient = {
          DataValue: uidRecipient,
          DisplayValue: tree.Recipients[index],
        };
        this.treeControl.getDescendants(tree).forEach(async (child) => {
          // Grab all descendants of the parent service item and create an order
          if (!child.isMandatory && child.isChecked && !child.isIndeterminate) {
            const uid = child.UidAccProduct;
            const childItem = await this.optionalItemMap[uid];
            const childRequestable = this.serviceItemsProvider.getServiceItemsForPersons([childItem], [recipient])[0];
            childRequestable.UidAccProductParent = child.parentUid;
            outgoingServiceOrder.requestables.push(childRequestable);
          }
        });
      });
    });
    this.sideSheetRef.close(outgoingServiceOrder);
  }

  public onSelectAll(): void {
    // Expand and set the state to selected
    this.treeControl.expandAll();
    this.treeControl.dataNodes.forEach((tree) => {
      this.treeControl.getDescendants(tree).forEach((child) => {
        child.isIndeterminate = false;
        child.parentChecked = true;
        child.isChecked = true;
      });
    });
    this.selected = this.totalLeaves;
  }

  public walkChildren(parent: ServiceItemHierarchyExtended, children: ServiceItemHierarchyExtended[]): void {
    // Walk all children based on parent state, then recursively apply to nested children.
    children.forEach((child) => {
      child.isIndeterminate = !parent.isChecked || parent.isIndeterminate;
      child.parentChecked = parent.isChecked;
      // Change selection count for checked and optional items based on indetermacy
      if (!child.isMandatory && child.isChecked) {
        child.isIndeterminate ? this.selected -= 1 : this.selected += 1;
      }
      this.walkChildren(child, [...child.Mandatory, ...child.Optional]);
    });
  }


  public onChange(value: MatCheckboxChange, leaf: ServiceItemHierarchyExtended): void {
    // Change state of this leaf
    value.checked ? (this.selected += 1) : (this.selected -= 1);
    leaf.isChecked = value.checked;
    leaf.isIndeterminate = false;
    // Modify all children to reflect parent state
    this.walkChildren(leaf, [...leaf.Mandatory, ...leaf.Optional]);
  }

  public onDeselectAll(): void {
    // Collapse and reset all states to initial
    this.treeControl.collapseAll();
    let index = 0;
    this.treeControl.dataNodes.forEach((tree) => {
      this.treeControl.getDescendants(tree).forEach((child) => {
        child.isChecked = this.initialState[index].isChecked;
        child.isIndeterminate = this.initialState[index].isIndeterminate;
        child.parentChecked = this.initialState[index].parentChecked;
        index += 1;
      });
    });
    this.selected = 0;
  }

  public displayNotRequestable(item: PortalShopServiceitems): boolean {
    return !item.IsRequestable.value;
  }

  public displayInfo(item: PortalShopServiceitems): boolean {
    return (
      item.IsRequestable.value &&
      this.isValueContains(item.OrderableStatus.value, [
        'PERSONHASOBJECT',
        'PERSONHASASSIGNMENTORDER',
        'ASSIGNED',
        'ORDER',
        'NOTORDERABLE',
        'CART',
      ])
    );
  }

  public isValueContains(input: string, values: string | string[]): boolean {
    const inputValues = MultiValue.FromString(input).GetValues();
    if (typeof values === 'string') {
      return inputValues.includes(values);
    }
    return inputValues.findIndex((i) => values.includes(i)) !== -1;
  }
}
