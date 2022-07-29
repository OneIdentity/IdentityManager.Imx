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

import { Component, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EuiLoadingService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { ArcFeatureSwitch } from 'imx-api-arc';
import { HELPER_ALERT_KEY_PREFIX, StorageService } from 'qbm';
import { Subscription } from 'rxjs';
import { ATTESTATION_FEATURE_KEY, FeatureAvailabilityService, REQUESTS_FEATURE_KEY } from './feature-availability.service';

const helperAlertKey = `${HELPER_ALERT_KEY_PREFIX}_featureAvailability`;

@Component({
  selector: 'imx-feature-availabilty',
  templateUrl: './feature-availabilty.component.html',
  styleUrls: ['./feature-availabilty.component.scss']
})
export class FeatureAvailabiltyComponent implements OnDestroy {

  public readonly settingsFormGroup: FormGroup;
  public featureSettings: ArcFeatureSwitch[] = [];
  public ATTESTATION_FEATURE_KEY: string = ATTESTATION_FEATURE_KEY;
  public REQUESTS_FEATURE_KEY: string = REQUESTS_FEATURE_KEY;
  private featureSettings$: Subscription;

  constructor(
    public formBuilder: FormBuilder,
    private storageService: StorageService,
    private featureAvailability: FeatureAvailabilityService,
    private readonly busyService: EuiLoadingService,
    private readonly snackbar: MatSnackBar,
    private readonly translate: TranslateService
  ) {
    this.settingsFormGroup = new FormGroup({ formArray: formBuilder.array([]) });
    this.featureAvailability.getFeatureSettings();
    this.featureSettings$ = this.featureAvailability.featureSettings$.subscribe(() => this.setupForm());
  }

  public ngOnDestroy(): void {
    if (this.featureSettings$) {
      this.featureSettings$.unsubscribe();
    }
  }

  public get showHelperAlert(): boolean {
    return !this.storageService.isHelperAlertDismissed(helperAlertKey);
  }

  get formArray(): FormArray {
    return this.settingsFormGroup.get('formArray') as FormArray;
  }

  public onHelperDismissed(): void {
    this.storageService.storeHelperAlertDismissal(helperAlertKey);
  }

  public async setupForm(): Promise<void> {
    this.formArray.controls = [];
    this.featureSettings = this.featureAvailability.featureSettings;
    this.featureSettings.forEach((setting: ArcFeatureSwitch) => {
      const formControl = new FormControl(setting.Value);
      this.formArray.push(formControl);
    });
  }

  public async save(): Promise<void> {
    const overlayRef = this.busyService.show();
    const updateData: { [key: string]: boolean} = {};
    this.featureSettings.forEach((setting: ArcFeatureSwitch, index: number) => {
      if (this.formArray.controls[index].dirty) {
        updateData[setting.Key] = this.formArray.controls[index].value;
      }
    });
    try {
      await this.featureAvailability.updateFeatureSettings(updateData);
      this.openSnackbar('#LDS#Your changes have been successfully saved. It may take some time for the changes to take effect.', '#LDS#Close');
    } finally {
      this.busyService.hide(overlayRef);
    }
  }

  public getFeatureDisplayName(key: string): string {
    let result = '';
    const match = key.match(RegExp(/\\[\s\S]*?\\/g));
    if (match?.length) {
      result = match[0].replace(/\\/g, '');
    }
    return result;
  }

  private openSnackbar(message: string, action: string): void {
    this.translate.get([message, action]).subscribe((translations: any[]) => {
      this.snackbar.open(translations[message], translations[action], { duration: 10000 });
    });
  }

}
