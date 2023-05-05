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
 * Copyright 2021 One Identity LLC.
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

import 'element-resize-detector';
import { NGXLogger } from 'ngx-logger';
import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';

import { AboutService } from './about/About.service';
import { IconStackComponent } from './icon-stack/icon-stack.component';
import { LoginComponent } from './login/login.component';
import { GlobalErrorHandler } from './base/global-error-handler';
import { MetadataService } from './base/metadata.service';
import { RegistryService } from './base/registry.service';
import { OpsupportDbObjectService } from './base/opsupport-db-object.service';
import { imx_SessionService } from './session/imx-session.service';
import { ImxTranslateLoader } from './translation/imx-translate-loader';
import { ImxTranslationProviderService } from './translation/imx-translation-provider.service';
import { imx_QBM_SearchService } from './search/search.service';
import { SnackBarService } from './snackbar/snack-bar.service';
import { TwoFactorAuthenticationComponent } from './two-factor-authentication/two-factor-authentication.component';
import { AboutComponent } from './about/About.component';
import { ExtService } from './ext/ext.service';
import { ExtComponent } from './ext/ext.component';
import { ExtDirective } from './ext/ext.directive';
import { ExtModule } from './ext/ext.module';
import { TestHelperModule } from './testing/TestHelperModule.spec';
import { FilterTileComponent } from './filter-tile/filter-tile.component';
import { DeviceStateService } from './services/device-state.service';
import { MasterDetailComponent } from './master-detail/master-detail.component';
import { ImxProgressbarComponent } from './progressbar/progressbar.component';
import { SearchBarComponent } from './searchbar/searchbar.component';
import { TranslateModule } from '@ngx-translate/core';
import { ImxTreeTableComponent } from './treeTable/treeTable.component';
import { ImxMatColumnComponent } from './treeTable/MatColumn';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';
import { EuiCoreModule } from '@elemental-ui/core';
import { TwoFactorAuthenticationService } from './two-factor-authentication/two-factor-authentication.service';
import { CdrEditorComponent } from './cdr/cdr-editor/cdr-editor.component';
import { CdrModule } from './cdr/cdr.module';
import { HyperViewModule } from './hyperview/hyperview.module';
import { ApiClientAngularService } from './api-client/api-client-angular.service';
import { AppConfigService } from './appConfig/appConfig.service';
import { UserActionService } from './base/user-action.service';
import { TableImageService } from './table-image/table-image.service';
import { FkCdrEditorProvider } from './cdr/fk-cdr-editor-provider';
import { DefaultCdrEditorProvider } from './cdr/default-cdr-editor-provider';
import { CdrRegistryService } from './cdr/cdr-registry.service';
import { DataTableModule } from './data-table/data-table.module';
import { AutoCompleteModule } from './auto-complete/auto-complete.module';
import { AutoCompleteComponent } from './auto-complete/auto-complete.component';
import { DataSourceToolbarModule } from './data-source-toolbar/data-source-toolbar.module';
import { MenuModule } from './menu/menu.module';
import { MastHeadModule } from './mast-head/mast-head.module';
import { UserMessageModule } from './user-message/user-message.module';
import { ClassloggerModule } from './classlogger/classlogger.module';
import { SelectModule } from './select/select.module';
import { DisableControlModule } from './disable-control/disable-control.module';
import { LdsReplaceModule } from './lds-replace/lds-replace.module';
import { TileModule } from './tile/tile.module';
import { RouterModule, Routes } from '@angular/router';
import { RouteGuardService } from './route-guard/route-guard.service';
import { ClassloggerService } from './classlogger/classlogger.service';
import { AuthenticationGuardService } from './authentication/authentication-guard.service';
import { JobQueueOverviewModule } from './jobqueue-overview/jobqueue-overview.module';
import { CacheService } from './cache/cache.service';

export function initApp(registry: CdrRegistryService, resolver: ComponentFactoryResolver, logger: NGXLogger): () => Promise<any> {
  logger.debug('init qbm');
  return () =>
    new Promise<any>(async (resolve: any) => {
      registry.register(new DefaultCdrEditorProvider(resolver));
      registry.register(new FkCdrEditorProvider(resolver));
      resolve();
    });
}

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    canActivate: [AuthenticationGuardService],
    resolve: [RouteGuardService],
  },
];

@NgModule({
  declarations: [
    TwoFactorAuthenticationComponent,
    AboutComponent,
    IconStackComponent,
    LoginComponent,
    FilterTileComponent,
    MasterDetailComponent,
    ImxProgressbarComponent,
    SearchBarComponent,
    ImxTreeTableComponent,
    ImxMatColumnComponent,
    MessageDialogComponent
    ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule,
    DisableControlModule,
    ExtModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatDialogModule,
    MatPaginatorModule,
    MatSelectModule,
    MatInputModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatProgressBarModule,
    ReactiveFormsModule,
    FormsModule,
    TestHelperModule,
    EuiCoreModule,
    HyperViewModule,
    CdrModule,
    DataTableModule,
    AutoCompleteModule,
    DataSourceToolbarModule,
    MenuModule,
    MastHeadModule,
    UserMessageModule,
    ClassloggerModule,
    SelectModule,
    UserMessageModule,
    LdsReplaceModule,
    TileModule,
    JobQueueOverviewModule
    ],
  providers: [
    GlobalErrorHandler,
    AppConfigService,
    AboutService,
    imx_SessionService,
    MetadataService,
    ImxTranslateLoader,
    ImxTranslationProviderService,
    RegistryService,
    OpsupportDbObjectService,
    UserActionService,
    imx_QBM_SearchService,
    SnackBarService,
    ExtService,
    DeviceStateService,
    ImxTreeTableComponent,
    TwoFactorAuthenticationService,
    ApiClientAngularService,
    TableImageService,
    CacheService
  ],
  exports: [
    TwoFactorAuthenticationComponent,
    AboutComponent,
    IconStackComponent,
    LoginComponent,
    ExtComponent,
    ExtDirective,
    FilterTileComponent,
    MasterDetailComponent,
    ImxProgressbarComponent,
    SearchBarComponent,
    ImxTreeTableComponent,
    ImxMatColumnComponent,
    CdrEditorComponent,
    MessageDialogComponent,
    AutoCompleteComponent
  ],
})
export class QbmModule {
  constructor(
    registry: CdrRegistryService,
    resolver: ComponentFactoryResolver,
    logger: ClassloggerService) {
      logger.info(this, '▶️ QbmModule loaded');
      registry.register(new DefaultCdrEditorProvider(resolver));
      registry.register(new FkCdrEditorProvider(resolver));
  }
 }
