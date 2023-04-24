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
 * Copyright 2022 One Identity LLC.
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

import { DateFormat, DbObjectKey, FkCandidateBuilder, FkCandidateRouteDto, ValType } from 'imx-qbm-dbts';
import { MergeActionList, MergeActions, RoleCompareItems, UiActionResultData } from 'imx-api-qer';
import { BaseCdr, ColumnDependentReference, EntityService } from 'qbm';
import { QerApiService } from '../../qer-api-client.service';

@Injectable({
  providedIn: 'root',
})
export class RollebackService {
  constructor(private readonly apiService: QerApiService, private readonly entityService: EntityService) {}

  public createCdrDate(): ColumnDependentReference {
    return new BaseCdr(
      this.entityService.createLocalEntityColumn(
        {
          ColumnName: 'ComparisonDate',
          Type: ValType.Date,
          MinLen: 1,
          DateFormat: DateFormat.Date
        },
        undefined,
        { ValueConstraint: { MaxValue: new Date() } }
      ),
      '#LDS#Comparison date'
    );
  }
}
