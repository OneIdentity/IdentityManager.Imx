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
