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
import { CanActivate, Router } from '@angular/router';
import { AttestationConfig } from 'imx-api-att';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class AttestationFeatureGuardService implements CanActivate {
  constructor(private attService: ApiService, private readonly router: Router) {}
  private config: AttestationConfig;

  public async getAttestationConfig(): Promise<AttestationConfig> {
    if (!this.config) {
      await this.setAttestationConfig();
    }
    return this.config;
  }

  public async setAttestationConfig(): Promise<void> {
    this.config = await this.attService.client.portal_attestation_config_get();
  }

  public async canActivate(): Promise<boolean> {
    await this.setAttestationConfig();

    const featureEnabled = this.config?.IsAttestationEnabled;
    if (featureEnabled) {
      return featureEnabled;
    }

    this.router.navigate(['']);
    return false;
  }
}
