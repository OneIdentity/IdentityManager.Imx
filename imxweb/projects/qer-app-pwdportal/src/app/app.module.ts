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

import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, APP_INITIALIZER, ErrorHandler } from '@angular/core';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { TranslateModule, TranslateLoader, MissingTranslationHandler, TranslateService } from '@ngx-translate/core';

import {
  ImxTranslateLoader,
  ImxMissingTranslationHandler,
  MastHeadModule,
  MenuModule,
  UserMessageModule,
  GlobalErrorHandler,
  Paginator,
  LdsReplacePipe,
  QbmModule,
  AuthenticationModule
} from 'qbm';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppService } from './app.service';
import { MatPaginatorIntl } from '@angular/material/paginator';
import {
  PasswordModule,
  QaLoginModule,
  PasscodeLoginModule,
} from 'qer';
import { environment } from '../environments/environment';
import appConfigJson from '../appconfig.json';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AppRoutingModule,
    AuthenticationModule,
    BrowserAnimationsModule,
    BrowserModule,
    EuiCoreModule,
    EuiMaterialModule,
    HttpClientModule,
    LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG, serverLogLevel: NgxLoggerLevel.OFF }),
    MastHeadModule,
    MenuModule,
    QaLoginModule,
    QbmModule,
    PasscodeLoginModule,
    PasswordModule,
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
    UserMessageModule
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
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
