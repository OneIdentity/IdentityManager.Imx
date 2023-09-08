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
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { PortalPersonAll } from 'imx-api-qer';
import { DisplayColumns, EntitySchema, ValType } from 'imx-qbm-dbts';
import { DataSourceToolbarSettings } from 'qbm';
import { NotRequestableMembershipsEntity } from './not-requestable-memberships-entity';

@Component({
  selector: 'imx-not-requestable-memberships',
  templateUrl: './not-requestable-memberships.component.html',
  styleUrls: ['./not-requestable-memberships.component.scss']
})
export class NotRequestableMembershipsComponent {

  public readonly DisplayColumns = DisplayColumns; // Enables use of this static class in Angular Templates.
  public dstSettings: DataSourceToolbarSettings;
  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: {
      notRequestableMemberships: NotRequestableMembershipsEntity[],
      entitySchema: EntitySchema,
      membershipName: string
    },
  ) {

    const displayedColumns = [
      data.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      {
        ColumnName: 'errorMessage',
        Type: ValType.String
      }
    ];

    this.dstSettings = {
      displayedColumns,
      dataSource: {
        Data: data.notRequestableMemberships,
        totalCount: data.notRequestableMemberships.length
      },
      entitySchema: data.entitySchema,
      navigationState: {}
    };
  }

}
