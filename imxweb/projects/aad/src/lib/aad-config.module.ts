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

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { EuiCoreModule } from '@elemental-ui/core';
import { ClassloggerService, DynamicMethodService } from 'qbm';
import { RequestableEntitlementTypeService, RequestableEntitlementType } from 'qer';
import { ApiService } from './api.service';
import { InitService } from './init.service';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    TranslateModule,
    EuiCoreModule
  ]
})
export class AadConfigModule {
  constructor(
    private readonly logger: ClassloggerService,
    private readonly initService: InitService,
    private readonly aadApiService: ApiService,
    private readonly dynamicMethodService: DynamicMethodService,
    private readonly entlTypeService: RequestableEntitlementTypeService) {
    this.logger.info(this, '🔥 AAD loaded');
    this.initService.onInit();

    this.entlTypeService.Register(async () => [
      new RequestableEntitlementType("AADDeniedServicePlan",
        this.aadApiService.apiClient,
        "UID_AADDeniedServicePlan",
        this.dynamicMethodService)
    ]);
    this.logger.info(this, '▶️ AAD initialized');
  }
}
