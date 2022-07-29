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

import { Injectable } from '@angular/core';
import { ArcFeatureSwitch } from 'imx-api-arc';
import { BehaviorSubject } from 'rxjs';
import { ArcApiService } from '../../services/arc-api-client.service';

export const ATTESTATION_FEATURE_KEY = 'QER\\Attestation\\DisplayInSIM';
export const REQUESTS_FEATURE_KEY = 'QER\\ITShop\\DisplayInSIM';

@Injectable({
  providedIn: 'root'
})
export class FeatureAvailabilityService {

  public featureSettings$ = new BehaviorSubject(this.featureSettings);
  private _featureSettings: ArcFeatureSwitch[] = [];

  constructor(private readonly arcApiClient: ArcApiService) { }

  get featureSettings(): ArcFeatureSwitch[] {
    return this._featureSettings;
  }

  set featureSettings(settings: ArcFeatureSwitch[]) {
    this._featureSettings = settings;
    if (this.featureSettings$) {
      this.featureSettings$.next(settings);
    }
  }

  public async getFeatureSettings(): Promise<ArcFeatureSwitch[]> {
    this.featureSettings = await this.arcApiClient.client.portal_config_certaccess_get();
    return this.featureSettings;
  }

  public async updateFeatureSettings(updateData: { [key: string]: boolean; }): Promise<ArcFeatureSwitch[]> {
    const updatedFeatureSettings = await this.arcApiClient.client.portal_config_certaccess_post(updateData);
    this.featureSettings = updatedFeatureSettings;
    return this.featureSettings;
  }
}
