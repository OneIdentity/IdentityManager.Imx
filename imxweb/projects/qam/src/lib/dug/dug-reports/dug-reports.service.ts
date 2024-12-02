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
import { TranslateService } from '@ngx-translate/core';

import { ExtendedTypedEntityCollection } from '@imx-modules/imx-qbm-dbts';
import { QamApiService } from '../../qam-api-client.service';
import { DugReportEntity } from './dug-report-entity';

@Injectable({ providedIn: 'root' })
export class DugReportService {
  constructor(
    private readonly api: QamApiService,
    private readonly translate: TranslateService,
  ) {}

  public async getReports(uid: string): Promise<ExtendedTypedEntityCollection<DugReportEntity, { [key: string]: string }[]>> {
    const resource = await this.api.client.portal_dge_resources_reports_get(uid);
    return DugReportEntity.buildEntities(
      DugReportEntity.buildEntityData(resource),
      resource.map((elem) => elem.PresetParameters!).filter((elem) => elem.presetParameters),
      DugReportEntity.GetEntitySchema(this.translate),
    );
  }
}
