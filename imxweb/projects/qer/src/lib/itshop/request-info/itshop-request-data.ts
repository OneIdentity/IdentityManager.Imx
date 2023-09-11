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

import { PwoData, PwoExtendedData } from 'imx-api-qer';
import { ParameterData } from 'imx-qbm-dbts';

export class ItshopRequestData {
  public readonly parameters: ParameterData[] = [];
  public readonly pwoData: PwoData;

  constructor(extendedCollectionData: { index: number } & PwoExtendedData) {
    if (extendedCollectionData.Parameters) {
      Object.keys(extendedCollectionData.Parameters).forEach(parameterCategoryName => {
        const parameterCategory = extendedCollectionData.Parameters[parameterCategoryName];
        if (parameterCategory && parameterCategory[extendedCollectionData.index]) {
          parameterCategory[extendedCollectionData.index].forEach(parameterData => this.parameters.push(parameterData));
        }
      });
    }

    if (extendedCollectionData.Data && extendedCollectionData.Data.length > 0) {
      this.pwoData = extendedCollectionData.Data[extendedCollectionData.index];
    }
  }
}
