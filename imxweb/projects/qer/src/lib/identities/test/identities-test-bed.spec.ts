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

import { TestModuleMetadata, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { EuiMaterialModule, EuiCoreModule } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { AppConfigService, AuthenticationService } from 'qbm';
import { IdentitiesCommonTestData } from './common-test-mocks.spec';

export class IdentitesTestBed {
  public static configureTestingModule(metadata: TestModuleMetadata): void {

    const baseImports = [
      HttpClientTestingModule,
      RouterTestingModule,
      TranslateModule.forRoot(),
      EuiMaterialModule,
      EuiCoreModule,
      LoggerTestingModule
    ];

    const baseProviders = [
      {
        provide: AppConfigService,
        useValue: IdentitiesCommonTestData.mockAppConfigService
      },
      {
        provide: AuthenticationService,
        useValue: IdentitiesCommonTestData.mockAuthenticationServiceStub
      }
    ];

    metadata.imports = baseImports.concat(metadata.imports || []);
    metadata.providers = baseProviders.concat(metadata.providers || []);
    metadata.schemas = [CUSTOM_ELEMENTS_SCHEMA];

    configureTestSuite(() => {
      TestBed.configureTestingModule(metadata);
    });
  }
}
