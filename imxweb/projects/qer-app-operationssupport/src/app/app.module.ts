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

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, ErrorHandler } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader, MissingTranslationHandler, TranslateService } from '@ngx-translate/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

import {
  ImxTranslateLoader,
  ImxMissingTranslationHandler,
  GlobalErrorHandler,
  Paginator,
  OpsupportDbObjectService,
  LdsReplacePipe,
  MenuModule,
  MastHeadModule,
  UserMessageModule,
  AuthenticationModule,
  RouteGuardService} from 'qbm';
import { OutstandingModule } from 'dpr';
import { ObjectSheetModule, QerModule } from 'qer';
import { AppRoutingModule } from './app-routing.module';
import { SyncModule } from './sync/sync.module';
import { ObjectOverviewModule } from './object-overview/object-overview.module';
import { WebApplicationsModule } from './web-applications/web-applications.module';
import { JournalModule } from './journal/journal.module';
import { UnresolvedRefsModule } from './unresolved-refs/unresolved-refs.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SystemOverviewModule } from './information/system-overview/system-overview.module';
import { SystemStatusModule } from './information/system-status/system-status.module';
import { ProcessesModule } from './processes/processes.module';
import { AppComponent } from './app.component';
import { AppService } from './app.service';
import { environment } from '../environments/environment';
import appConfigJson from '../appconfig.json';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    QerModule,
    ObjectSheetModule,
    AppRoutingModule,
    AuthenticationModule,
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG, serverLogLevel: NgxLoggerLevel.OFF }),
    MastHeadModule,
    MenuModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: ImxTranslateLoader
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: ImxMissingTranslationHandler
      }
    }),
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
  ],
  providers: [
    { provide: 'environment', useValue: environment },
    { provide: 'appConfigJson', useValue: appConfigJson },
    {
      provide: APP_INITIALIZER,
      useFactory: AppService.init,
      deps: [AppService],
      multi: true
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    {
      provide: MatPaginatorIntl,
      useFactory: Paginator.Create,
      deps: [
        TranslateService,
        LdsReplacePipe
      ]
    },
    RouteGuardService,
    OpsupportDbObjectService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
