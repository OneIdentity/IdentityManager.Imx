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

import { DbObjectKey, IEntity} from 'imx-qbm-dbts';
import { MetadataService } from '../../base/metadata.service';
import { CdrFactoryService } from '../../cdr/cdr-factory.service';

@Component({
  templateUrl: './tree-selection-list.component.html',
  styleUrls: ['./tree-selection-list.component.scss']
})
export class TreeSelectionListComponent implements OnInit {

  public items: { entities: IEntity[], tableName: string }[];
  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly data: IEntity[],
    private readonly metadataProvider: MetadataService) {
  }

  public ngOnInit(): void {
    const allItems = this.data.map((elem: IEntity) => ({ entity: elem, tableName: this.getTableName(elem) }));
    const tables = allItems.map(elem => elem.tableName).filter((v, i, a) => a.indexOf(v) === i);

    this.items = tables.map(elem => ({
      entities: allItems.filter(ent => ent.tableName === elem).map(ent => ent.entity),
      tableName: elem
    }));

  }

  private getTableName(entity: IEntity): string {
    const column = CdrFactoryService.tryGetColumn(entity, 'XObjectKey');
    if (!column || column.GetValue() === '') {
      return '';
    }

    const tableName = DbObjectKey.FromXml(column.GetValue()).TableName;
    return this.metadataProvider.tables[tableName]?.DisplaySingular || tableName;
  }

}
