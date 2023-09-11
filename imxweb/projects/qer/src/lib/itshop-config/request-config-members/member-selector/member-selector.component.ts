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

import { Component, Inject } from '@angular/core';
import { EUI_SIDESHEET_DATA, EuiSidesheetRef } from '@elemental-ui/core';
import { CollectionLoadParameters, EntityCollectionData, FilterTreeData, TypedEntity } from 'imx-qbm-dbts';
import { BusyService } from 'qbm';

@Component({
  templateUrl: './member-selector.component.html',
  styleUrls: ['./member-selector.component.scss'],
})
export class MemberSelectorComponent {
  public selectedItems: TypedEntity[] = [];
  public busyService = new BusyService();

  constructor(
    public readonly dialogRef: EuiSidesheetRef,
    @Inject(EUI_SIDESHEET_DATA)
    public readonly data: {
      get: (parameters: CollectionLoadParameters) => Promise<EntityCollectionData>;
      GetFilterTree?: (parentKey: string) => Promise<FilterTreeData>;
      isMultiValue: boolean;
    }
  ) {}

  public selectionChanged(items: TypedEntity[]): void {
    this.selectedItems = items;
  }

  public applySelection(selected?: TypedEntity): void {
    if (selected) {
      this.selectedItems = [selected];
    }
    const selectedValues = [];
    this.selectedItems.forEach((typedEntity) => {
      const keys = typedEntity.GetEntity().GetKeys();
      const val = keys?.length ? keys[0] : undefined;
      selectedValues.push(val);
    });
    this.dialogRef.close(selectedValues);
  }
}
