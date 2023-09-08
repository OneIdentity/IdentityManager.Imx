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
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, Routes } from '@angular/router';
import { EuiCoreModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  AuthConfigProvider,
  AuthenticationService,
  CaptchaModule,
  CdrModule,
  CustomAuthFlow,
  MastHeadModule,
  ParameterizedTextModule,
  UserMessageModule,
  ClassloggerService,
} from 'qbm';
import { ApiService } from '../api.service';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { NewUserComponent } from './new-user.component';
import { OpenSidesheetComponent } from './open-sidesheet.component';
import { UserActivationComponent } from './user-activation.component';

const routes: Routes = [
  {
    path: 'useractivation',
    component: UserActivationComponent,
  },
];

@NgModule({
  imports: [
    CaptchaModule,
    CdrModule,
    CommonModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MastHeadModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatCardModule,
    ParameterizedTextModule,
    UserMessageModule,
    TranslateModule,
    EuiCoreModule,
  ],
  declarations: [OpenSidesheetComponent, NewUserComponent, UserActivationComponent, ConfirmDialogComponent],
})
export class NewUserModule {
  constructor(authService: AuthenticationService, router: Router, apiService: ApiService, private readonly logger: ClassloggerService) {
    const newUserAuthProvider: AuthConfigProvider = {
      display: '#LDS#Create new account',
      name: 'NewUser',
      authProps: [],
      customAuthFlow: new NewUserFlow(),
    };

    apiService.client.register_featureconfig_get().then((c) => {
      if (c.SelfRegistrationEnabled) {
        authService.registerAuthConfigProvider(newUserAuthProvider);
      }
    });

    this.logger.info(this, '▶️ NewUser initialized');
    this.addRoutes(router);
  }

  private addRoutes(router: Router): void {
    const config = router.config;
    routes.forEach((route) => {
      config.unshift(route);
    });
    router.resetConfig(config);
  }
}

class NewUserFlow implements CustomAuthFlow {
  public getEntryComponent() {
    return OpenSidesheetComponent;
  }
}
