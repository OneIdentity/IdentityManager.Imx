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

import { ActivateFactorData, AuthFactors, VerifyPollingResult } from 'imx-api-olg';
import { OlgApiService } from '../olg-api-client.service';

@Injectable({ providedIn: 'root' })
export class PortalMfaService {
  constructor(private readonly api: OlgApiService) {}

  public activateFactor(workflowActionId: string, deviceId: string): Promise<ActivateFactorData> {
    return this.api.client.portal_onelogin_mfa_activate_post(workflowActionId, deviceId);
  }

  public verifyWithVerificationId(workflowActionId: string, verificationId: string, code: string, deviceId?: string): Promise<boolean> {
    return this.api.client.portal_onelogin_mfa_verifyotpwithverificationid_post(workflowActionId, verificationId, code, {
      deviceid: deviceId,
    });
  }

  public verifyWithPolling(workflowActionId: string, verificationId: string): Promise<VerifyPollingResult> {
    return this.api.client.portal_onelogin_mfa_poll_get(workflowActionId, verificationId);
  }

  public getFactors(): Promise<AuthFactors> {
    return this.api.client.portal_onelogin_mfa_factors_get();
  }
}
