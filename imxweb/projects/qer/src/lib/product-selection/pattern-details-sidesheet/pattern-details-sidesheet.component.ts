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

import { Component, Inject, OnInit } from '@angular/core';
import { EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { PortalShopServiceitems, QerProjectConfig } from 'imx-api-qer';
import { DisplayColumns, MultiValue } from 'imx-qbm-dbts';
import { ColumnDependentReference, BaseReadonlyCdr } from 'qbm';

@Component({
  selector: 'imx-pattern-details-sidesheet',
  templateUrl: './pattern-details-sidesheet.component.html',
  styleUrls: ['./pattern-details-sidesheet.component.scss']
})
export class PatternDetailsSidesheetComponent implements OnInit {
  public cdrLists: ColumnDependentReference[][] = [];
  public roleAssignments: boolean[];
  public atLeastOneRoleAssignment = true;


  constructor(
    @Inject(EUI_SIDESHEET_DATA) public data: {
      items: PortalShopServiceitems[],
      projectConfig: QerProjectConfig
    }
  ) {
    this.roleAssignments = data.items.map(item => ['ESet', 'QERAssign'].includes(item.TableName.value));
    this.atLeastOneRoleAssignment = this.roleAssignments.some(item => item);
   }

  public async ngOnInit(): Promise<void> {
    const properties = this.data.projectConfig.ITShopConfig.AccProductProperties;
    this.cdrLists = this.data.items.map(item => {
      return [
        new BaseReadonlyCdr(item.GetEntity().GetColumn(DisplayColumns.DISPLAY_PROPERTYNAME)),
        new BaseReadonlyCdr(item.TableName.Column),
        new BaseReadonlyCdr(item.Tags.Column),
        ...properties.map(prop => new BaseReadonlyCdr(item.GetEntity().GetColumn(prop)))
      ];
    });
  }

  public displayNotRequestable(item: PortalShopServiceitems): boolean  {
    return !item.IsRequestable.value;
  }

  public displayInfo(item: PortalShopServiceitems): boolean {
    return (item.IsRequestable.value &&
    this.isValueContains(item.OrderableStatus.value, ['PERSONHASOBJECT', 'PERSONHASASSIGNMENTORDER', 'ASSIGNED', 'ORDER', 'NOTORDERABLE', 'CART'])
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
