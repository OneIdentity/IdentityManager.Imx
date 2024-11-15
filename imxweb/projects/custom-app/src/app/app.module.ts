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

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

import { MatPaginatorIntl } from '@angular/material/paginator';
import {
  AuthenticationModule,
  CustomThemeModule,
  GlobalErrorHandler,
  ImxMissingTranslationHandler,
  ImxTranslateLoader,
  LdsReplacePipe,
  MastHeadModule,
  Paginator,
  QbmModule,
  UserMessageModule,
} from 'qbm';
import appConfigJson from '../appconfig.json';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppService } from './app.service';
import { StartComponent } from './start.component';

@NgModule({ declarations: [AppComponent, StartComponent],
    bootstrap: [AppComponent], imports: [AppRoutingModule,
        AuthenticationModule,
        BrowserAnimationsModule,
        BrowserModule,
        EuiCoreModule,
        EuiMaterialModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatProgressSpinnerModule,
        LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG, serverLogLevel: NgxLoggerLevel.OFF }),
        MastHeadModule,
        QbmModule,
        CustomThemeModule,
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
        UserMessageModule], providers: [
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
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class AppModule {}
