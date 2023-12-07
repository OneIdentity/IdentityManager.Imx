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
 * Copyright 2023 One Identity LLC.
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
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { MissingTranslationHandler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

import {
  AuthenticationModule,
  CdrRegistryService,
  CustomThemeModule,
  GlobalErrorHandler,
  ImxMissingTranslationHandler,
  ImxTranslateLoader,
  LdsReplacePipe,
  MastHeadModule,
  MenuModule,
  ObjectHistoryApiService,
  ObjectHistoryModule,
  Paginator,
  UserMessageModule,
} from 'qbm';
import {
  AddressbookModule,
  ApprovalsModule,
  ArchivedRequestsModule,
  DelegationModule,
  IdentitiesModule,
  ItshopPatternModule,
  NewRequestModule,
  ObjectHyperviewService,
  ProductSelectionModule,
  ProfileModule,
  QerModule,
  QpmIntegrationModule,
  RelatedApplicationsModule,
  RequestConfigModule,
  RequestHistoryModule,
  ResourcesModule,
  RiskConfigModule,
  RoleManangementModule,
  ServiceCategoriesModule,
  ServiceItemsEditModule,
  ShoppingCartModule,
  StatisticsModule,
  ViewDevicesModule,
  MyResponsibilitiesViewModule,
  ApprovalWorkFlowModule,
  DataExplorerViewModule,
  UserProcessModule,
  SourceDetectiveModule,
  RoleMembershipsModule,
  TeamResponsibilitiesModule
} from 'qer';

import { APP_BASE_HREF } from '@angular/common';
import appConfigJson from '../appconfig.json';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppService } from './app.service';
import { PortalHyperviewService } from './hyperview/portal-hyperview.service';
import { PortalHistoryService } from './portal-history.service';

export const HEADLESS_BASEHREF = '/headless';
export function getBaseHref(): string {
  return location.href.includes('headless') ? HEADLESS_BASEHREF : '';
}
@NgModule({
  declarations: [AppComponent],
  imports: [
    AppRoutingModule,
    AuthenticationModule,
    BrowserAnimationsModule,
    BrowserModule,
    EuiCoreModule,
    EuiMaterialModule,
    HttpClientModule,
    IdentitiesModule,
    ResourcesModule,
    LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG, serverLogLevel: NgxLoggerLevel.OFF }),
    MatDialogModule,
    MatTabsModule,
    MastHeadModule,
    MenuModule,
    AddressbookModule,
    QerModule,
    ProfileModule,
    RoleManangementModule,
    StatisticsModule,
    QpmIntegrationModule,
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
    UserMessageModule,
    DelegationModule,
    ShoppingCartModule,
    ObjectHistoryModule,
    ProductSelectionModule,
    ApprovalsModule,
    ItshopPatternModule,
    RequestConfigModule,
    RequestHistoryModule,
    ServiceCategoriesModule,
    ServiceItemsEditModule,
    NewRequestModule,
    RiskConfigModule,
    ArchivedRequestsModule,
    RelatedApplicationsModule,
    ViewDevicesModule,
    MyResponsibilitiesViewModule,
    ApprovalWorkFlowModule,
    DataExplorerViewModule,
    UserProcessModule,    
    SourceDetectiveModule,
    RoleMembershipsModule,
    TeamResponsibilitiesModule
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
      provide: ObjectHistoryApiService,
      useClass: PortalHistoryService,
    },
    {
      provide: ObjectHyperviewService,
      useClass: PortalHyperviewService
    },
    {
      provide: MatPaginatorIntl,
      useFactory: Paginator.Create,
      deps: [TranslateService, LdsReplacePipe],
    },
    {
      provide: APP_BASE_HREF,
      useValue: getBaseHref(),
    },
    CdrRegistryService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
