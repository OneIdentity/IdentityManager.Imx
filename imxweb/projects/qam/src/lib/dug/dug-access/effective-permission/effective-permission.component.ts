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
import { EntitySchema, IClientProperty, IEntity } from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import { AssignedResourceAccessData, ResourceAccessMembersData, ResourceAccessTrusteeData } from '../../../TypedClient';

import { TreeDatabase } from 'qbm';
import { EffectivePermissionTreeDatabase } from './effective-permission-tree-database';
import { TrusteeEntityHierarchy } from './trustee-entity-hierarchy';

@Component({
  selector: 'imx-effective-permission',
  templateUrl: './effective-permission.component.html',
  styleUrls: ['./effective-permission.component.scss', '../../../qam.scss'],
})
export class EffectivePermissionComponent implements OnChanges {
  @Input() trustees: AssignedResourceAccessData;
  @Input() accessData: ResourceAccessTrusteeData[];

  @Input() trusteeTypes: { [id: number]: string };

  public entitySchema: EntitySchema;

  public displayedEntity: IEntity;
  public permissionColumns: IClientProperty[];

  public treeDataBase: TreeDatabase;

  public entities: TrusteeEntityHierarchy[];

  public members: ResourceAccessMembersData[];

  /* */

  constructor(translate: TranslateService) {
    this.entitySchema = TrusteeEntityHierarchy.GetEntitySchema(translate);

    this.permissionColumns = [
      this.entitySchema.Columns.AllowWrite,
      this.entitySchema.Columns.AllowRead,
      this.entitySchema.Columns.AnyAllow,
      this.entitySchema.Columns.AllowFullControl,
      this.entitySchema.Columns.AllowChangePermissions,
    ];
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes?.trustees?.currentValue?.Trustees == null) {
      return;
    }
    this.entities = TrusteeEntityHierarchy.buildEntities(
      TrusteeEntityHierarchy.buildEntityData(this.trustees.Trustees),
      this.entitySchema,
    ).Data;
    this.treeDataBase = new EffectivePermissionTreeDatabase(this.entities);

    this.treeDataBase.dataReloaded$.next(true);
  }

  public async showDetails(entity: IEntity): Promise<void> {
    this.displayedEntity = entity;
    this.members = this.accessData.find((elem) => elem.Display === entity.GetColumn('Display').GetValue())?.Members ?? [];
  }
}
