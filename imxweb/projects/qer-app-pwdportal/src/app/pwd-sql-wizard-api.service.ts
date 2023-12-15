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
import { FilterProperty, CollectionLoadParameters, EntityCollectionData } from 'imx-qbm-dbts';
import { SqlWizardApiService } from 'qbm';

@Injectable({
  providedIn: 'root',
})
export class PwdSqlWizardApiService extends SqlWizardApiService {
  public implemented: boolean = false;

  getFilterProperties(table: string): Promise<FilterProperty[]> {
    return new Promise((resolve) => resolve([]));
  }
  
  getCandidates(parentTable: string, options?: CollectionLoadParameters): Promise<EntityCollectionData> {
    return new Promise((resolve) => resolve({ TotalCount: 0 }));
  }

  constructor() {
    super();
  }
}
