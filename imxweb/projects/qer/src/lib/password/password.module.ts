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

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { RouterModule } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';

import { AboutService, ConfirmationModule, LdsReplaceModule, MetadataService, TileModule } from 'qbm';
import { TilesModule } from '../tiles/tiles.module';
import { PwdAboutService } from './about/pwd-about.service';
import { CheckPasswordsComponent } from './check-passwords.component';
import { PasswordDashboardComponent } from './dashboard.component';
import { PwdMetadataService } from './metadata/pwd-metadata.service';
import { PasswordQueryComponent } from './password-query.component';
import { PasswordResetComponent } from './password-reset.component';
import { PasswordService } from './password.service';

@NgModule({
  imports: [
    CommonModule,
    ConfirmationModule,
    EuiCoreModule,
    EuiMaterialModule,
    FormsModule,
    LdsReplaceModule,
    TranslateModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatIconModule,
    RouterModule,
    TilesModule,
    TileModule,
    ReactiveFormsModule,
  ],
  providers: [
    PasswordService,
    {
      provide: AboutService,
      useClass: PwdAboutService,
    },
    {
      provide: MetadataService,
      useClass: PwdMetadataService,
    },
  ],
  exports: [PasswordResetComponent],
  declarations: [CheckPasswordsComponent, PasswordDashboardComponent, PasswordResetComponent, PasswordQueryComponent],
})
export class PasswordModule {}
