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
import { TranslateService } from '@ngx-translate/core';

import { ParmData } from 'imx-api-att';
import { EntityColumnData, IEntityColumn, MultiValue, ValType } from 'imx-qbm-dbts';
import { EntityService } from 'qbm';
import { PolicyService } from '../policy.service';
import { FilterElementModel } from './filter-element-model';

@Injectable({
  providedIn: 'root'
})
export class FilterElementColumnService {
  constructor(
    public readonly policyService: PolicyService,
    private readonly translateService: TranslateService,
    private readonly entityService: EntityService) { }

  public buildColumn(
    parmdata: ParmData,
    uidParameter: string,
    value: string,
    caption: string,
    displays: string[],
    withfk: boolean): IEntityColumn {

    if (parmdata == null) {
      return undefined;
    }

    const propertyName = parmdata.RequiredParameter;
    return this.entityService.createLocalEntityColumn({
      Type: ValType.String,
      IsMultiValued: withfk,
      ColumnName: parmdata.ColumnName || propertyName,
      MinLen: withfk ? 1 : 0,
      Display: caption ? this.translateService.instant(caption) : '',
      FkRelation: withfk ? {
        IsMemberRelation: false,
        ParentTableName: parmdata.TableName,
        ParentColumnName: parmdata.ColumnName
      } : undefined
    }, withfk ? [{
      columnName: parmdata.ColumnName,
      fkTableName: parmdata.TableName,
      parameterNames: [
        'OrderBy',
        'StartIndex',
        'PageSize',
        'filter',
        'search',
      ],
      load: async (__, parameters?) => {
        return this.policyService.getFilterCandidates(parameters, uidParameter);
      },
      getDataModel: async () => ({}),
      getFilterTree: async ()=>({})
    }] : [], this.getValue(withfk, value, displays));
  }

  private getValue(withfk: boolean, value: string, displays: string[]): EntityColumnData {
    if (withfk) {
      return {
        Value: FilterElementModel.buildMultiValueSeparatedList(value),
        DisplayValue: displays ? new MultiValue(displays).GetStringValue() : ''
      };
    }
    return {
      Value: value,
      DisplayValue: displays ? new MultiValue(displays).GetStringValue() : ''
    };
  }
}
