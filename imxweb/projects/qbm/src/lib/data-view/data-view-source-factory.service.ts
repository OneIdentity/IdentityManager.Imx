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
import { TypedEntity } from '@imx-modules/imx-qbm-dbts';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { ConfirmationService } from '../confirmation/confirmation.service';
import { ProcessingQueueService } from '../processing-queue/processing-queue.service';
import { SettingsService } from '../settings/settings-service';
import { SqlWizardApiService } from '../sqlwizard/sqlwizard-api.service';
import { DataViewSource } from './data-view-source';

@Injectable({
  providedIn: 'root',
})
export class DataViewSourceFactoryService {
  constructor(
    private readonly settings: SettingsService,
    private readonly log: ClassloggerService,
    private readonly confirmService: ConfirmationService,
    private readonly sqlWizardApiService: SqlWizardApiService,
    private readonly queueService: ProcessingQueueService,
  ) {}

  public getDataSource<T extends TypedEntity = TypedEntity, ExtendedType = any>(): DataViewSource<T> {
    return new DataViewSource<T>(this.settings, this.log, this.confirmService, this.sqlWizardApiService, this.queueService);
  }
}
