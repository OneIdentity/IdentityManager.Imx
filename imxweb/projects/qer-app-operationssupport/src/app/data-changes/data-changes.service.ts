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
import { imx_SessionService } from 'qbm';
import { ChangeType as ChangeTypeEnum, HistoryOperationsData } from 'imx-api-qbm';
import { TranslateService } from '@ngx-translate/core';
import { ChangeType } from './data-changes.component';

@Injectable()
export class DataChangesService {
  public changeTypes: ChangeType[] = [
    { name: 'Insert', title: this.translateService.instant('#LDS#Event Insert'), value: 0 },
    { name: 'Update', title: this.translateService.instant('#LDS#Event Update'), value: 1 },
    { name: 'Delete', title: this.translateService.instant('#LDS#Event Delete'), value: 2 },
  ];

  constructor(
    private session: imx_SessionService,
    private translateService: TranslateService
  ) {}

  public async getHistoryOperationsDataByUserName(username: string,options?: { backto: Date} ): Promise<HistoryOperationsData> {
    return await this.session.Client.opsupport_changeoperations_user_get(username,options);
  }

  public async getHistoryOperationsDataByChangeType(options?: { backto: Date, backfrom: Date, types: number }): Promise<HistoryOperationsData> {
    return await this.session.Client.opsupport_changeoperations_time_get(options);
  }

  public changeTypeString(changeType: ChangeTypeEnum): string | undefined {
    switch (changeType) {
      case ChangeTypeEnum.Insert:
        return this.changeTypes.find((obj) => {
          return obj.value === 0;
        })?.title;
      case ChangeTypeEnum.Update:
        return this.changeTypes.find((obj) => {
          return obj.value === 1;
        })?.title;
      case ChangeTypeEnum.Delete:
        return this.changeTypes.find((obj) => {
          return obj.value === 2;
        })?.title;
    }
  }
}
