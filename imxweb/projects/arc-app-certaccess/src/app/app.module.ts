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
import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, ErrorHandler, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { TranslateModule, TranslateLoader, MissingTranslationHandler, TranslateService } from '@ngx-translate/core';
import {
  CdrRegistryService,
  GlobalErrorHandler,
  ImxTranslateLoader,
  ImxMissingTranslationHandler,
  MenuModule,
  LdsReplacePipe,
  Paginator,
  UserMessageModule,
  QbmModule,
  AuthenticationModule,
  ClassloggerService,
} from 'qbm';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppService } from './services/app.service';
import {
  AddressbookModule,
  ObjectsheetPersonModule,
  ProductSelectionModule,
  QerModule,
  ObjectSheetModule,
  ProfileModule,
  ShoppingCartModule,
  ServiceCategoriesModule,
  ApprovalsModule,
  RequestHistoryModule,
  TilesModule,
  IdentitiesModule,
  DelegationModule,
  RoleManangementModule
} from 'qer';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { DataExplorerModule } from './data-explorer/data-explorer.module';
import { UnsgroupsModule} from './responsibilities/unsgroups/unsgroups.module';
import { GovernanceMastheadModule } from './governance-masthead/governance-masthead.module';
import { ReportsModule } from './reports/reports.module';
import { AdminGuardService } from './services/admin-guard.service';
import { AttConfigModule, PolicyModule } from 'att';
import { TsbConfigModule } from 'tsb';
import { SubscriptionsModule } from 'rps';
import { ConfigurationModule } from './configuration/configuration.module';
import { TeamsModule } from 'o3t';
import { AadConfigModule, AzureAdModule } from 'aad';
import { DashboardPluginComponent } from './dashboard-plugin/dashboard-plugin.component';
import { RequestShopAlertComponent } from './configuration/request-shop-alert/request-shop-alert.component';
import { environment } from '../environments/environment';
import appConfigJson from '../appconfig.json';
import { OpsWebLinkPluginComponent } from './dashboard-plugin/opsweblink-plugin.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardPluginComponent,
    OpsWebLinkPluginComponent,
    RequestShopAlertComponent
  ],
  imports: [
    CommonModule,
    QbmModule,
    QerModule,
    AttConfigModule,
    PolicyModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    EuiCoreModule,
    EuiMaterialModule,
    HttpClientModule,
    LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG, serverLogLevel: NgxLoggerLevel.OFF }),
    GovernanceMastheadModule,
    MenuModule,
    AddressbookModule,
    DataExplorerModule,
    IdentitiesModule,
    ConfigurationModule,
    UnsgroupsModule,
    ProfileModule,
    ReportsModule,
    DelegationModule,
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
    UserMessageModule,
    ShoppingCartModule,
    AuthenticationModule,
    ObjectSheetModule,
    ObjectsheetPersonModule,
    ProductSelectionModule,
    ServiceCategoriesModule,
    RequestHistoryModule,
    ApprovalsModule,
    RoleManangementModule,
    SubscriptionsModule,
    TsbConfigModule,
    AzureAdModule,
    TeamsModule,
    AadConfigModule,
    TilesModule,
    TeamsModule
  ],
  providers: [
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
    CdrRegistryService,
    AdminGuardService,
    { provide: 'environment', useValue: environment },
    { provide: 'appConfigJson', useValue: appConfigJson },

  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(logger: ClassloggerService) {
    logger.info(this, '▶️ Cert Access loaded');

  }
}
