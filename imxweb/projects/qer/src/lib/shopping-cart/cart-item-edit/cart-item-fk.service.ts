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

import { ParameterData } from 'imx-qbm-dbts';
import { FkProviderItem, IFkCandidateProvider, InteractiveEntityWriteData } from 'imx-qbm-dbts';
import { QerApiService } from '../../qer-api-client.service';

@Injectable({
  providedIn: 'root'
})
export class CartItemFkService {
  constructor(private readonly qerClient: QerApiService) { }

  public getFkProviderItemsInteractive(
    interactiveEntity: { InteractiveEntityWriteData: InteractiveEntityWriteData },
    parameterData: ParameterData
  ): IFkCandidateProvider {
    
    const qerClient = this.qerClient;

    return new class implements IFkCandidateProvider {
      getProviderItem(_columnName, fkTableName) {
        if (parameterData.Property.FkRelation) {
          return this.getFkProviderItemInteractive(interactiveEntity, parameterData.Property.ColumnName, parameterData.Property.FkRelation.ParentTableName);
        }

        if (parameterData.Property.ValidReferencedTables) {
          const t = parameterData.Property.ValidReferencedTables.map(parentTableRef =>
            this.getFkProviderItemInteractive(interactiveEntity, parameterData.Property.ColumnName, parentTableRef.TableName)
          ).filter(t => t.fkTableName == fkTableName);
          if (t.length == 1)
            return t[0];
          return null;
        }

        return null;
      }
    
      private getFkProviderItemInteractive(
        interactiveEntity: { InteractiveEntityWriteData: InteractiveEntityWriteData },
        columnName: string,
        fkTableName: string
      ): FkProviderItem {
        return {
          columnName,
          fkTableName,
          parameterNames: [
            'OrderBy',
            'StartIndex',
            'PageSize',
            'filter',
            'search'
          ],
          load: async (__, parameters?) => {
            return qerClient.client.portal_cartitem_interactive_parameter_candidates_post(
              columnName,
              fkTableName,
              interactiveEntity.InteractiveEntityWriteData,
              parameters
            );
          },
          getDataModel: async () => ({}),
          getFilterTree: async (__, parentkey) => {
            return qerClient.client.portal_cartitem_interactive_parameter_candidates_filtertree_post(
              columnName, fkTableName, interactiveEntity.InteractiveEntityWriteData, { parentkey: parentkey }
            );
          }
        };
      }
    };
  }

}
