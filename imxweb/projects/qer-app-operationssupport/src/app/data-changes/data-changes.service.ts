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
 * Copyright 2024 One Identity LLC.
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
import { EuiSelectOption } from '@elemental-ui/core';
import { ChangeType as ChangeTypeEnum, HistoryOperationsData } from '@imx-modules/imx-api-qbm';
import { TranslateService } from '@ngx-translate/core';
import { imx_SessionService } from 'qbm';

@Injectable()
export class DataChangesService {
  public changeTypes: EuiSelectOption[];

  constructor(
    private session: imx_SessionService,
    private translateService: TranslateService,
  ) {
    this.changeTypes = this.loadChangeTypes();
  }

  public async getHistoryOperationsDataByUserName(username: string, options?: { backto: Date }): Promise<HistoryOperationsData> {
    return await this.session.Client.opsupport_changeoperations_user_get(username, options);
  }

  public async getHistoryOperationsDataByChangeType(options?: {
    backto: Date;
    backfrom: Date;
    types: number;
  }): Promise<HistoryOperationsData> {
    return await this.session.Client.opsupport_changeoperations_time_get(options);
  }

  public changeTypeString(changeType: ChangeTypeEnum): string | undefined {
    switch (changeType) {
      case ChangeTypeEnum.Insert:
        return this.changeTypes.find((obj) => {
          return obj.value === 1;
        })?.display;
      case ChangeTypeEnum.Update:
        return this.changeTypes.find((obj) => {
          return obj.value === 2;
        })?.display;
      case ChangeTypeEnum.Delete:
        return this.changeTypes.find((obj) => {
          return obj.value === 4;
        })?.display;
    }
  }

  public loadChangeTypes(): EuiSelectOption[] {
    return [
      { name: 'Insert', display: this.translateService.instant('#LDS#Event Insert'), value: 1 },
      { name: 'Update', display: this.translateService.instant('#LDS#Event Update'), value: 2 },
      { name: 'Delete', display: this.translateService.instant('#LDS#Event Delete'), value: 4 },
    ];
  }
}
