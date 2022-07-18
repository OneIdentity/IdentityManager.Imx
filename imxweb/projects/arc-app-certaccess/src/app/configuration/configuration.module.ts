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

import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdrModule, DataSourceToolbarModule, DataTableModule, FkAdvancedPickerModule, LdsReplaceModule, RouteGuardService } from 'qbm';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { AdminGroupsComponent } from './admin-groups/admin-groups.component';
import { AdminMembersComponent } from './admin-members/admin-members.component';
import { RouterModule, Routes } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FeatureAvailabiltyComponent } from './feature-availabilty/feature-availabilty.component';
import { AttestationSchedulesComponent } from './attestation-schedules/attestation-schedules.component';
import { AttestationScheduleSidesheetComponent } from './attestation-schedules/attestation-schedule-sidesheet/attestation-schedule-sidesheet.component';
import { RequestsEntitySelectorComponent } from './requests-selector/requests-entity-selector.component';
import { AdminGuardService } from '../services/admin-guard.service';

const routes: Routes = [
  {
    path: 'configuration/administratorgroups',
    component: AdminGroupsComponent,
    canActivate: [RouteGuardService, AdminGuardService],
    resolve: [RouteGuardService]
  },
  {
    path: 'configuration/features',
    component: FeatureAvailabiltyComponent,
    canActivate: [RouteGuardService, AdminGuardService],
    resolve: [RouteGuardService]
  },
  {
    path: 'configuration/schedules',
    component: AttestationSchedulesComponent,
    canActivate: [RouteGuardService, AdminGuardService],
    resolve: [RouteGuardService]
  }
];


import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

export const EUI_DATE_FORMATS = {
  parse: {
    dateInput: ['LL', 'L'],
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@NgModule({
  declarations: [
    AdminGroupsComponent,
    AdminMembersComponent,
    FeatureAvailabiltyComponent,
    AttestationSchedulesComponent,
    AttestationScheduleSidesheetComponent,
    RequestsEntitySelectorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EuiCoreModule,
    EuiMaterialModule,
    CdrModule,
    TranslateModule,
    DataSourceToolbarModule,
    DataTableModule,
    MatTooltipModule,
    LdsReplaceModule,
    FkAdvancedPickerModule,
    RouterModule.forChild(routes),
  ],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: EUI_DATE_FORMATS }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ConfigurationModule { }
