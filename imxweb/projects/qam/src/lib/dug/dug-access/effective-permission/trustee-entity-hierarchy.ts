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
  EntityColumnData,
  EntityData,
  EntitySchema,
  ExtendedTypedEntityCollection,
  IClientProperty,
  IReadValue,
  IWriteValue,
  TypedEntity,
  TypedEntityBuilder,
  ValType,
} from '@imx-modules/imx-qbm-dbts';

import { TranslateService } from '@ngx-translate/core';
import { AssignedResourceAccess } from '../../../TypedClient';

export class TrusteeEntityHierarchy extends TypedEntity {
  public readonly Display: IReadValue<string> = this.GetEntityValue('Display');
  public readonly TypeDisplay: IReadValue<string> = this.GetEntityValue('TypeDisplay');
  public readonly TrusteeType: IReadValue<number> = this.GetEntityValue('TrusteeType');
  public readonly AllowWrite: IReadValue<boolean> = this.GetEntityValue('AllowWrite');
  public readonly AllowRead: IReadValue<boolean> = this.GetEntityValue('AllowRead');
  public readonly AnyAllow: IReadValue<boolean> = this.GetEntityValue('AnyAllow');
  public readonly AllowFullControl: IReadValue<boolean> = this.GetEntityValue('AllowFullControl');
  public readonly AllowChangePermissions: IReadValue<boolean> = this.GetEntityValue('AllowChangePermissions');
  public readonly Parent: IReadValue<string> = this.GetEntityValue('Parent');
  public readonly HasChildren: IWriteValue<boolean> = this.GetEntityValue('HasChildren');
  public readonly HasPermissions: IWriteValue<boolean> = this.GetEntityValue('HasPermissions');

  public static GetEntitySchema(translate?: TranslateService): EntitySchema {
    const returnColumns: { [key: string]: IClientProperty } = {};

    returnColumns.Display = {
      Type: ValType.String,
      ColumnName: 'Display',
      Display: translate ? translate.instant('#LDS#Display name') : '#LDS#Display name',
    };

    returnColumns.TypeDisplay = {
      Type: ValType.String,
      ColumnName: 'TypeDisplay',
      Display: translate ? translate.instant('#LDS#Type display') : '#LDS#Type display',
    };

    returnColumns.TrusteeType = {
      Type: ValType.Int,
      ColumnName: 'TrusteeType',
      Display: translate ? translate.instant('#LDS#Trustee type') : '#LDS#Trustee type',
    };

    returnColumns.HasPermissions = {
      Type: ValType.Bool,
      ColumnName: 'HasPermissions',
    };

    returnColumns.AllowWrite = {
      Type: ValType.Bool,
      ColumnName: 'AllowWrite',
      Display: translate ? translate.instant('#LDS#Allow write') : '#LDS#Allow write',
    };

    returnColumns.AllowRead = {
      Type: ValType.Bool,
      ColumnName: 'AllowRead',
      Display: translate ? translate.instant('#LDS#Allow read') : '#LDS#Allow read',
    };

    returnColumns.AnyAllow = {
      Type: ValType.Bool,
      ColumnName: 'AnyAllow',
      Display: translate ? translate.instant('#LDS#Any allow') : '#LDS#Any allow',
    };

    returnColumns.AllowFullControl = {
      Type: ValType.Bool,
      ColumnName: 'AllowFullControl',
      Display: translate ? translate.instant('#LDS#Allow full control') : '#LDS#Allow full control',
    };

    returnColumns.AllowChangePermissions = {
      Type: ValType.Bool,
      ColumnName: 'AllowChangePermissions',
      Display: translate ? translate.instant('#LDS#Allow change permissions') : '#LDS#Allow change permissions',
    };

    returnColumns.Parent = {
      Type: ValType.String,
      ColumnName: 'Parent',
    };

    returnColumns.HasChildren = {
      Type: ValType.Bool,
      ColumnName: 'HasChildren',
    };

    return {
      TypeName: 'Trustee',
      Display: translate ? translate.instant('#LDS#Trustee') : '#LDS#Trustee',
      Columns: returnColumns,
    };
  }

  public static buildEntities(
    entityData: EntityData[],
    entitySchema: EntitySchema,
  ): ExtendedTypedEntityCollection<TrusteeEntityHierarchy, unknown> {
    const builder = new TypedEntityBuilder(TrusteeEntityHierarchy);
    return builder.buildReadWriteEntities(
      {
        TotalCount: entityData.length,
        Entities: entityData,
      },
      entitySchema,
    );
  }

  public static buildEntityData(trustees: AssignedResourceAccess[] | undefined): EntityData[] {
    return !trustees
      ? []
      : trustees.concat(this.getMissingParent(trustees)).map((elem) => {
          const returnColumns: { [key: string]: EntityColumnData } = {};
          returnColumns.Display = { Value: elem.Display, IsReadOnly: true };
          returnColumns.TrusteeType = { Value: elem.TrusteeType, IsReadOnly: true };
          returnColumns.TypeDisplay = { Value: elem.TypeDisplay, IsReadOnly: true };
          returnColumns.HasPermissions = { Value: elem.Permissions != null, IsReadOnly: true };
          returnColumns.AllowWrite = { Value: elem.Permissions?.includes('AllowWrite'), IsReadOnly: true };
          returnColumns.AllowRead = { Value: elem.Permissions?.includes('AllowRead'), IsReadOnly: true };
          returnColumns.AnyAllow = { Value: elem.Permissions?.includes('AnyAllow'), IsReadOnly: true };
          returnColumns.AllowFullControl = { Value: elem.Permissions?.includes('AllowFullControl'), IsReadOnly: true };
          returnColumns.AllowChangePermissions = { Value: elem.Permissions?.includes('AllowChangePermissions'), IsReadOnly: true };
          returnColumns.Parent = {
            Value: this.getParentValue(elem.Display),
            IsReadOnly: true,
            DisplayValue: this.getParentDisplay(elem.Display),
          };
          returnColumns.HasChildren = { IsReadOnly: false };

          return { Columns: returnColumns, Display: elem.Display?.split('\\').pop() };
        });
  }

  private static getMissingParent(trustees: AssignedResourceAccess[]): AssignedResourceAccess[] {
    const parentValues = trustees.map((elem) => this.getParentValue(elem.Display));
    const missing = [...new Set(parentValues.filter((elem) => trustees.every((trus) => trus.Display !== elem)))];
    return missing.map((elem) => ({ TrusteeType: -1, Display: elem })).filter((elem) => elem.Display !== '');
  }

  private static getParentDisplay(parent: string | undefined): string {
    if (parent == null || parent?.indexOf('\\') === -1) {
      return '';
    }
    const parts = parent.split('\\');
    return parts[parts.length - 2];
  }

  private static getParentValue(parent: string | undefined): string {
    if (parent == null || parent?.indexOf('\\') === -1) {
      return '';
    }
    const parts = parent.split('\\');
    parts.pop();
    return parts.join('\\');
  }
}
