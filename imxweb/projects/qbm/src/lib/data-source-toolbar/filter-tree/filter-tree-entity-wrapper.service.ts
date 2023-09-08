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

import { Injectable } from '@angular/core';
import { DisplayBuilder, DisplayPattern, EntityColumnData, EntityData, EntitySchema, FilterTreeData, FilterTreeElement, IClientProperty, IEntity, ReadWriteEntity, ValType } from 'imx-qbm-dbts';
import { ImxTranslationProviderService } from '../../translation/imx-translation-provider.service';

@Injectable({
  providedIn: 'root'
})
export class FilterTreeEntityWrapperService {
  constructor(
    private readonly translate: ImxTranslationProviderService
  ) { }

  /**
   * Converts a list of FilterTreeData objects into a list or correlating entities
   * @param data The filter tree data object returned by the server
   * @returns a list of entity objects
   */
  public convertToEntities(data: FilterTreeData, parentDisplay: string): IEntity[] {
    return data.Elements.map(filter => this.buildTreeFilterDataEntity(filter, parentDisplay));
  }

  private buildTreeFilterDataEntity(data: FilterTreeElement, parentDisplay: string): IEntity {
    return new ReadWriteEntity(
      this.buildProperties(),
      this.buildEntityData(data, parentDisplay),
      undefined,
      undefined,
      new DisplayBuilder(this.translate)
    );
  }

  private buildProperties(): EntitySchema {
    const ret: { [key: string]: IClientProperty } = {};

    ret['Display'] = {
      Type: ValType.String,
      ColumnName: 'Display'
    };

    ret['Filter'] = {
      Type: ValType.String,
      ColumnName: 'Filter'
    };

    ret['HasChildren'] = {
      Type: ValType.Bool,
      ColumnName: 'HasChildren'
    };

    ret['ObjectKey'] = {
      Type: ValType.String,
      ColumnName: 'ObjectKey'
    };

    ret['LongDisplay'] = {
      Type: ValType.String,
      ColumnName: 'LongDisplay'
    };

    return {
      DisplayPattern: new DisplayPattern('%Display%'),
      Columns: ret
    };
  }

  private buildEntityData(data: FilterTreeElement, parentDisplay: string): EntityData {
    const ret: { [key: string]: EntityColumnData } = {};

    ret['Display'] = { Value: data.Display, IsReadOnly: true, DisplayValue: data.Display };

    ret['Filter'] = { Value: data.Filter, IsReadOnly: true };

    ret['HasChildren'] = { Value: data.HasHierarchy, IsReadOnly: true };

    ret['ObjectKey'] = { Value: data.ObjectKey, IsReadOnly: true };

    ret['LongDisplay'] = {
      Value: (parentDisplay || '') === '' ? data.Display : `${parentDisplay}\\${data.Display}`,
      IsReadOnly: true
    };

    return { Columns: ret, Keys: [JSON.stringify(data.Filter)] };
  }
}

