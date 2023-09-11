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

import { ComponentFactoryResolver, Component, ViewChild, OnInit } from '@angular/core';

import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import { ExtDirective } from '../ext/ext.directive';
import { imx_SessionService } from '../session/imx-session.service';
import { ISessionState } from '../session/session-state';

@Component({
  selector: 'imx-2fahost',
  template: `
    <ng-template imxExtd></ng-template>
  `
})
export class TwoFactorAuthenticationComponent implements OnInit {
  @ViewChild(ExtDirective, { static: true }) public directive: ExtDirective;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private twoFactorAuthService: TwoFactorAuthenticationService,
    private sessionService: imx_SessionService
  ) {}

  public ngOnInit(): void {
    this.sessionService.getSessionState().then((sessionState: ISessionState) => {
      const selectedProvider = this.twoFactorAuthService.Registry[sessionState.SecondaryAuthName];
      if (selectedProvider) {
        this.directive.viewContainerRef.clear();
        this.directive.viewContainerRef.createComponent(this.componentFactoryResolver.resolveComponentFactory(selectedProvider));
      } else {
        // TODO log
      }
    });
  }
}
