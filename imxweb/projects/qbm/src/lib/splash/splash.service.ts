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


import { Injectable } from '@angular/core';
import { EuiSplashScreenConfig, EuiSplashScreenOptions, EuiSplashScreenService } from '@elemental-ui/core';

@Injectable({
  providedIn: 'root'
})
export class SplashService {

  private defaultOptions: EuiSplashScreenConfig = {
    applicationName: 'One Identity Manager',
    icon: 'oi-horizontal',
    showSpinner: true,
    message: 'Loading...'
  };

  constructor(
    private readonly splash: EuiSplashScreenService,
  ) { }

  public init(options: EuiSplashScreenOptions): void {
    // open splash screen with fix values
    const config = {
      ...this.defaultOptions,
      ...options
    };    
    this.splash.open(config);
  }

  public async update(options: EuiSplashScreenOptions): Promise<void> {
    // update the splash screen and use translated texts and the title from the imxconfig
    this.splash.updateState(options);
  }

  public close(): void {
    this.splash.close();
  }
}
