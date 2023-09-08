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

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Routes, RouterModule } from '@angular/router';
import { EuiCoreModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { BusyIndicatorModule, CdrModule, ClassloggerService } from 'qbm';
import { InitService } from './init.service';

import { MfaComponent } from './mfa/mfa.component';
import { MfaService } from './mfa/mfa.service';
import { PortalMfaService } from './mfa/portal-mfa.service';
import { MfaFormControlComponent } from './mfa-form-control/mfa-form-control.component';

const routes: Routes = [
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule.forChild(routes),
    TranslateModule,
    EuiCoreModule,
    CdrModule,
    BusyIndicatorModule,
    MatProgressSpinnerModule
  ],
  declarations: [
    MfaComponent,
    MfaFormControlComponent
  ],
  providers: [
    PortalMfaService
  ],
  exports: [
    MfaFormControlComponent
  ]
})
export class OlgConfigModule {
  constructor(private readonly initializer: InitService, private readonly logger: ClassloggerService) {
    this.logger.info(this, '🔥 OLG loaded');
    this.initializer.onInit(routes);
    this.logger.info(this, '▶️ OLG initialized');
  }
}
