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

import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import { MatTooltipModule } from '@angular/material/tooltip';
import {
  BusyIndicatorModule,
  CdrModule,
  ClassloggerModule,
  DataSourceToolbarModule,
  DataTableModule,
  DataTilesModule,
  DataTreeModule,
  DataTreeWrapperModule,
  DataViewModule,
  DateModule,
  EntityModule,
  FkAdvancedPickerModule,
  HelpContextualModule,
  ImageModule,
  InfoModalDialogModule,
  LdsReplaceModule,
  QbmModule,
} from 'qbm';
import { ObjectHyperviewModule } from 'qer';
import { ApplicationPropertyModule } from '../application-property/application-property.module';
import { ColumnInfoModule } from '../column-info/column-info.module';
import { EntitlementsModule } from '../entitlements/entitlements.module';
import { KpiModule } from '../kpi/kpi.module';
import { AobUserModule } from '../user/user.module';
import { ApplicationCreateComponent } from './application-create/application-create.component';
import { ApplicationDetailComponent } from './application-detail.component';
import { ApplicationDetailsComponent } from './application-details/application-details.component';
import { ApplicationImageSelectComponent } from './application-image-select/application-image-select.component';
import { ImageSelectorDialogComponent } from './application-image-select/image-selector-dialog/image-selector-dialog.component';
import { ApplicationNavigationComponent } from './application-navigation/application-navigation.component';
import { ApplicationsComponent } from './applications.component';
import { ApplicationsService } from './applications.service';
import { AuthenticationRootComponent } from './edit-application/authentication-root/authentication-root.component';
import { EditApplicationComponent } from './edit-application/edit-application.component';
import { EditServiceCategoryInformationComponent } from './edit-application/service-category/edit-service-category-information/edit-service-category-information.component';
import { ServiceCategoryComponent } from './edit-application/service-category/service-category.component';
import { IdentitiesComponent } from './identities/identities.component';
import { IdentityDetailComponent } from './identities/identity-detail/identity-detail.component';

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
    EditServiceCategoryInformationComponent,
  ],
  imports: [
    CommonModule,
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
    ObjectHyperviewModule,
    DataViewModule,
  ],
  providers: [ApplicationsService],
  exports: [ApplicationsComponent],
})
export class ApplicationsModule {}
