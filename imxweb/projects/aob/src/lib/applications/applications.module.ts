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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { RouterModule } from '@angular/router';
import { PortalModule } from '@angular/cdk/portal';

import { ApplicationDetailComponent } from './application-detail.component';
import { ApplicationDetailsComponent } from './application-details/application-details.component';
import { ApplicationHyperviewModule } from './application-hyperview/application-hyperview.module';
import { ApplicationNavigationComponent } from './application-navigation/application-navigation.component';
import { ApplicationsComponent } from './applications.component';
import { ApplicationsService } from './applications.service';
import { ColumnInfoModule } from '../column-info/column-info.module';
import { EditApplicationComponent } from './edit-application/edit-application.component';
import { EntitlementsModule } from '../entitlements/entitlements.module';
import { KpiModule } from '../kpi/kpi.module';
import {
  ClassloggerModule,
  DataSourceToolbarModule,
  DataTilesModule,
  QbmModule,
  SelectModule,
  LdsReplaceModule,
  FkAdvancedPickerModule,
  EntityModule,
  ImageModule,
  CdrModule,
  DataTableModule,
  DateModule,
  InfoModalDialogModule,
  HelpContextualModule,
  BusyIndicatorModule,
  DataTreeModule,
  DataTreeWrapperModule
} from 'qbm';
import { AobUserModule } from '../user/user.module';
import { ApplicationPropertyModule } from '../application-property/application-property.module';
import { ApplicationCreateComponent } from './application-create/application-create.component';
import { ApplicationImageSelectComponent } from './application-image-select/application-image-select.component';
import { ImageSelectorDialogComponent } from './application-image-select/image-selector-dialog/image-selector-dialog.component';
import { AuthenticationRootComponent } from './edit-application/authentication-root/authentication-root.component';
import { IdentitiesComponent } from './identities/identities.component';
import { IdentityDetailComponent } from './identities/identity-detail/identity-detail.component';
import { ServiceCategoryComponent } from './edit-application/service-category/service-category.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EditServiceCategoryInformationComponent } from './edit-application/service-category/edit-service-category-information/edit-service-category-information.component';

@NgModule({
  declarations: [
    ApplicationsComponent,
    ApplicationDetailComponent,
    ApplicationDetailsComponent,
    ApplicationNavigationComponent,
    EditApplicationComponent,
    ApplicationCreateComponent,
    ApplicationImageSelectComponent,
    ImageSelectorDialogComponent,
    AuthenticationRootComponent,
    IdentitiesComponent,
    IdentityDetailComponent,
    ServiceCategoryComponent,
    EditServiceCategoryInformationComponent
  ],
  imports: [
    CommonModule,
    ApplicationHyperviewModule,
    ApplicationPropertyModule,
    ClassloggerModule,
    ColumnInfoModule,
    EntitlementsModule,
    EuiCoreModule,
    EuiMaterialModule,
    FormsModule,
    KpiModule,
    LdsReplaceModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatTabsModule,
    SelectModule,
    MatDialogModule,
    MatTooltipModule,
    QbmModule,
    DateModule,
    ReactiveFormsModule,
    TranslateModule,
    AobUserModule,
    DataSourceToolbarModule,
    DataTableModule,
    DataTilesModule,
    DataTreeModule,
    DataTreeWrapperModule,
    RouterModule,
    OverlayModule,
    PortalModule,
    FkAdvancedPickerModule,
    EntityModule,
    ImageModule,
    CdrModule,
    InfoModalDialogModule,
    HelpContextualModule,
    BusyIndicatorModule,
  ],
  providers: [
    ApplicationsService
  ],
  exports: [
    ApplicationsComponent,
  ],
})
export class ApplicationsModule { }
