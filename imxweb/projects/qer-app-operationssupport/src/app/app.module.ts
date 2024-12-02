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

import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

import { OutstandingModule } from 'dpr';
import { RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha-2';
import {
  AuthenticationModule,
  CustomThemeModule,
  GlobalErrorHandler,
  ImxMissingTranslationHandler,
  ImxTranslateLoader,
  LdsReplacePipe,
  MastHeadModule,
  OpsupportDbObjectService,
  Paginator,
  RouteGuardService,
  SqlWizardApiService,
  SqlWizardModule,
  UserMessageModule,
} from 'qbm';
import { OpsModule } from 'qer';
import appConfigJson from '../appconfig.json';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppService } from './app.service';
import { OpsSqlWizardApiService } from './base/ops-sql-wizard-api.service';
import { DashboardModule } from './dashboard/dashboard.module';
import { DataChangesModule } from './data-changes/data-changes.module';
import { DbQueueModule } from './db-queue/db-queue.module';
import { SystemOverviewModule } from './information/system-overview/system-overview.module';
import { SystemStatusModule } from './information/system-status/system-status.module';
import { JournalModule } from './journal/journal.module';
import { ObjectOverviewModule } from './object-overview/object-overview.module';
import { ProcessesModule } from './processes/processes.module';
import { SyncModule } from './sync/sync.module';
import { UnresolvedRefsModule } from './unresolved-refs/unresolved-refs.module';
import { WebApplicationsModule } from './web-applications/web-applications.module';

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [
    AppRoutingModule,
    AuthenticationModule,
    BrowserAnimationsModule,
    BrowserModule,
    EuiCoreModule,
    EuiMaterialModule,
    LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG, serverLogLevel: NgxLoggerLevel.OFF }),
    MastHeadModule,
    DbQueueModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: ImxTranslateLoader,
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: ImxMissingTranslationHandler,
      },
    }),
    CustomThemeModule,
    UserMessageModule,
    SyncModule,
    ObjectOverviewModule,
    WebApplicationsModule,
    JournalModule,
    UnresolvedRefsModule,
    DashboardModule,
    SystemOverviewModule,
    SystemStatusModule,
    ProcessesModule,
    OutstandingModule,
    DataChangesModule,
    OpsModule,
    SqlWizardModule,
  ],
  providers: [
    { provide: 'environment', useValue: environment },
    { provide: 'appConfigJson', useValue: appConfigJson },
    {
      provide: APP_INITIALIZER,
      useFactory: AppService.init,
      deps: [AppService],
      multi: true,
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
    {
      provide: MatPaginatorIntl,
      useFactory: Paginator.Create,
      deps: [TranslateService, LdsReplacePipe],
    },
    RouteGuardService,
    OpsupportDbObjectService,
    {
      provide: SqlWizardApiService,
      useClass: OpsSqlWizardApiService,
    },
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useFactory: (config: AppService) => {
        return config.recaptchaSiteKeyV3;
      },
      deps: [AppService],
    },
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {}
