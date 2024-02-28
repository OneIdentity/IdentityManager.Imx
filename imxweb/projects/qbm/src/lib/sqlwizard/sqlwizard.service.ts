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
import { FilterProperty } from 'imx-qbm-dbts';
import { DateDiffUnit } from 'imx-qbm-dbts';
import { SqlViewSettings } from './SqlNodeView';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable()
export class SqlWizardService {
  public constructor(authentication: AuthenticationService) {

    authentication.onSessionResponse.subscribe(async (elem) => {
      this.currentUser = elem.UserUid;
    });
  }

  private currentUser: string;

  private _cache: Map<string, Promise<FilterProperty[]>> = new Map();

  private _dateDiffUnits: DateDiffOption[] = [
    { DisplayMl: '#LDS#SW_Years', Value: DateDiffUnit.Years },
    { DisplayMl: '#LDS#SW_Months', Value: DateDiffUnit.Months },
    { DisplayMl: '#LDS#SW_Days', Value: DateDiffUnit.Days },
    { DisplayMl: '#LDS#SW_Hours', Value: DateDiffUnit.Hours },
  ];

  public getColumns(viewSettings: SqlViewSettings, tableName: string): Promise<FilterProperty[]> {
    const tableUser = tableName + this.currentUser;
    if (this._cache.has(tableUser)) {
      return this._cache.get(tableUser);
    }
    const promise = this.getInternal(tableName, viewSettings);
    this._cache.set(tableUser, promise);
    return promise;
  }

  public getDateDiffUnits(): DateDiffOption[] {
    return this._dateDiffUnits;
  }

  private async getInternal(tableName: string, viewSettings: SqlViewSettings): Promise<FilterProperty[]> {
    return viewSettings.sqlWizardService.getFilterProperties(tableName);
  }
}

export interface DateDiffOption {
  readonly Value: DateDiffUnit;
  readonly DisplayMl: string;
}
