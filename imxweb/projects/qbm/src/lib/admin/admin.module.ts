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

import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { DataSourceToolbarModule } from '../data-source-toolbar/data-source-toolbar.module';
import { DateModule } from '../date/date.module';
import { LdsReplaceModule } from '../lds-replace/lds-replace.module';
import { AddConfigSidesheetComponent } from './add-config-sidesheet.component';
import { ApplyConfigSidesheetComponent } from './apply-config-sidesheet.component';
import { ConfigKeyPathComponent } from './config-key-path.component';
import { ConfigComponent } from './config.component';
import { ConfigService } from './config.service';
import { ConvertConfigSidesheetComponent } from './convert-config-sidesheet.component';
import { DashboardComponent } from './dashboard.component';
import { DeleteConfigSidesheetComponent } from './delete-config-sidesheet.component';
import { ListSettingComponent } from './list-setting.component';
import { LogDetailsSidesheetComponent } from './log-details-sidesheet.component';
import { LogsComponent } from './logs.component';
import { PackagesComponent } from './packages.component';
import { SelectValueComponent } from './select-value.component';
import { StatusComponent } from './status.component';
import { StatusService } from './status.service';
import { SwaggerComponent } from './swagger/swagger.component';
import { CacheComponent } from './cache.component';
import { PluginsComponent } from './plugins.component';
import { InfoModalDialogModule } from './../info-modal-dialog/info-modal-dialog.module';
import { SqlWizardApiService } from '../sqlwizard/sqlwizard-api.service';
import { QbmSqlWizardService } from '../base/qbm-sqlwizard.service';
import { SideNavigationViewModule } from '../side-navigation-view/side-navigation-view.module';

@NgModule({
  imports: [
    CommonModule,
    DataSourceToolbarModule,
    DragDropModule,
    EuiCoreModule,
    EuiMaterialModule,
    FormsModule,
    LdsReplaceModule,
    MatButtonModule,
    MatBadgeModule,
    MatCheckboxModule,
    MatDialogModule,
    MatExpansionModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    MatSidenavModule,
    MatProgressSpinnerModule,
    MatTreeModule,
    TranslateModule,
    DateModule,
    ScrollingModule,
    InfoModalDialogModule,
    SideNavigationViewModule,
  ],
  providers: [
    ConfigService,
    StatusService,
    {
      provide: SqlWizardApiService,
      useClass: QbmSqlWizardService,
    },
  ],
  declarations: [
    AddConfigSidesheetComponent,
    ApplyConfigSidesheetComponent,
    CacheComponent,
    ConvertConfigSidesheetComponent,
    ConfigComponent,
    ConfigKeyPathComponent,
    DeleteConfigSidesheetComponent,
    ListSettingComponent,
    DashboardComponent,
    PackagesComponent,
    PluginsComponent,
    SelectValueComponent,
    StatusComponent,
    LogsComponent,
    LogDetailsSidesheetComponent,
    SwaggerComponent,
  ],
})
export class AdminModule {}
