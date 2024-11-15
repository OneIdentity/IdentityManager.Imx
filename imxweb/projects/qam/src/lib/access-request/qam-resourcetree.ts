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
  TypedEntity,
  TypedEntityBuilder,
  ValType,
} from '@imx-modules/imx-qbm-dbts';
import { TreeNode } from '../TypedClient';

import { TranslateService } from '@ngx-translate/core';

export class QamTreeNode implements TreeNode {
  UidQamDug?: string;
  Display?: string;
  IsTarget: boolean;
  Nodes?: TreeNode[];
}

export class QamResourcetree extends TypedEntity {
  public readonly Display: IReadValue<string> = this.GetEntityValue('Display');
  public readonly UidQamDug: IReadValue<string> = this.GetEntityValue('UidQamDug');
  public readonly IsTarget: IReadValue<boolean> = this.GetEntityValue('IsTarget');
  // public readonly HasChildren: IWriteValue<boolean> = this.GetEntityValue('HasChildren');

  public Nodes: QamResourcetree[] = [];
  public static GetEntitySchema(translate?: TranslateService): EntitySchema {
    const returnColumns: { [key: string]: IClientProperty } = {};

    returnColumns.Display = {
      Type: ValType.String,
      ColumnName: 'Display',
      Display: translate ? translate.instant('#LDS#Display name') : '#LDS#Display name',
    };

    returnColumns.UidQamDug = {
      Type: ValType.String,
      ColumnName: 'UidQamDug',
      Display: translate ? translate.instant('#LDS#UidQamDug') : '#LDS#UidQamDug',
    };

    returnColumns.IsTarget = {
      Type: ValType.Bool,
      ColumnName: 'IsTarget',
      Display: translate ? translate.instant('#LDS#Is Target') : '#LDS#Is Target',
    };

    returnColumns.HasChildren = {
      Type: ValType.Bool,
      ColumnName: 'HasChildren',
    };

    return {
      TypeName: 'QamResourcetree',
      Display: translate ? translate.instant('#LDS#QamResourcetree') : '#LDS#QamResourcetree',
      Columns: returnColumns,
    };
  }

  public static buildEntities(
    entityData: EntityData[],
    entitySchema: EntitySchema,
  ): ExtendedTypedEntityCollection<QamResourcetree, unknown> {
    const builder = new TypedEntityBuilder(QamResourcetree);
    const typedEntityCollection = builder.buildReadWriteEntities(
      {
        TotalCount: entityData.length,
        Entities: entityData,
      },
      entitySchema,
    );
    return typedEntityCollection;
  }

  public static buildEntityData(nodes: TreeNode[]): EntityData[] {
    return nodes.map((elem) => {
      const returnColumns: { [key: string]: EntityColumnData } = {};
      returnColumns.Display = { Value: elem.Display, IsReadOnly: true };
      returnColumns.IsTarget = { Value: elem.IsTarget, IsReadOnly: true };
      returnColumns.UidQamDug = { Value: elem.UidQamDug, IsReadOnly: true };
      returnColumns.HasChildren = { Value: elem.Nodes && elem.Nodes.length > 0, IsReadOnly: true };
      returnColumns.nodes = { Value: elem.Nodes, IsReadOnly: true };
      return { Columns: returnColumns, Display: elem.Display };
    });
  }

  public static buildSingleEntityData(node: TreeNode): EntityData {
    const returnColumns: { [key: string]: EntityColumnData } = {};
    returnColumns.Display = { Value: node.Display, IsReadOnly: true };
    returnColumns.IsTarget = { Value: node.IsTarget, IsReadOnly: true };
    returnColumns.UidQamDug = { Value: node.UidQamDug, IsReadOnly: true };
    returnColumns.HasChildren = { Value: node.Nodes && node.Nodes.length > 0, IsReadOnly: true };
    return { Columns: returnColumns, Display: node.Display };
  }
}
