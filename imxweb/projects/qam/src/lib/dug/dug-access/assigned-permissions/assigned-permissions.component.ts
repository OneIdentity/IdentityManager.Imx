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

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DisplayColumns, EntitySchema, IClientProperty } from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import { DataSourceToolbarSettings } from 'qbm';
import { AssignedResourceAccessData } from '../../../TypedClient';
import { TrusteeEntity } from './trustee-entity';

@Component({
  selector: 'imx-assigned-permissions',
  templateUrl: './assigned-permissions.component.html',
  styleUrls: ['./assigned-permissions.component.scss'],
})
export class AssignedPermissionsComponent implements OnChanges {
  @Input() trustees: AssignedResourceAccessData;

  public dstSettings: DataSourceToolbarSettings;
  public entitySchema: EntitySchema;
  private displayedColumns: IClientProperty[] = [];
  public readonly DisplayColumns = DisplayColumns;

  constructor(translate: TranslateService) {
    this.entitySchema = TrusteeEntity.GetEntitySchema(translate);
    this.displayedColumns = [
      this.entitySchema.Columns.Display,
      this.entitySchema.Columns.AllowChangePermissions,
      this.entitySchema.Columns.AllowFullControl,
      this.entitySchema.Columns.AllowWrite,
      this.entitySchema.Columns.AllowRead,
      this.entitySchema.Columns.AnyAllow,
    ];
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (!changes?.trustees == null) {
      return;
    }
    const data = TrusteeEntity.buildEntities(TrusteeEntity.buildEntityData(this.trustees.Trustees), this.entitySchema);
    this.dstSettings = {
      displayedColumns: this.displayedColumns,
      dataSource: data,
      entitySchema: this.entitySchema,
      navigationState: {},
    };
  }
}
