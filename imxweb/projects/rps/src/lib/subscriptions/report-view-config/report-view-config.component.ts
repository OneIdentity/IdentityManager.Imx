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

import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ChangeDetectorRef, Component, Injector, OnDestroy } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { EuiDownloadDirective, EuiLoadingService, EuiSidesheetRef } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { MethodDefinition } from 'imx-qbm-dbts';
import { AppConfigService, BaseCdr, ColumnDependentReference, ConfirmationService, ElementalUiConfigService, ErrorService } from 'qbm';
import { ReportSubscription } from '../report-subscription/report-subscription';
import { ReportSubscriptionService } from '../report-subscription/report-subscription.service';
import { V2ApiClientMethodFactory } from 'imx-api-rps';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'imx-report-view-config',
  templateUrl: './report-view-config.component.html'
})
export class ReportViewConfigComponent implements OnDestroy {

  private formControls = new FormArray([]);
  public readonly reportFormGroup = new FormGroup({
    reportTable: new FormControl(undefined, Validators.required),
    parameters: this.formControls
  });
  public newSubscription: ReportSubscription;
  public parameterCdrList: ColumnDependentReference[] = [];

  private closeClickSubscription: Subscription;
  private reportChangeSubscription: Subscription;
  private readonly apiMethodFactory: V2ApiClientMethodFactory = new V2ApiClientMethodFactory();
  private disposable: () => void;

  constructor(
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly reportSubscriptionService: ReportSubscriptionService,
    private readonly confirmation: ConfirmationService,
    private readonly busyService: EuiLoadingService,
    private readonly elementalUiConfigService: ElementalUiConfigService,
    private readonly cdref: ChangeDetectorRef,
    private readonly config: AppConfigService,
    private readonly http: HttpClient,
    private readonly injector: Injector,
    private readonly translate: TranslateService,
    private readonly overlay: Overlay,
    errorService: ErrorService
  ) {
    this.closeClickSubscription = this.sidesheetRef.closeClicked().subscribe(async () => {
      this.sidesheetRef.close(false);
    });
    this.reportChangeSubscription = this.reportFormGroup.get('reportTable').valueChanges.subscribe(async val => {
      let overlayRef: OverlayRef;
      setTimeout(() => overlayRef = this.busyService.show());
      try {
        const uidReport = val;
        this.formControls.clear();

        // Standard caption is "Format (e-mail attachment)" -> change
        const format = await this.translate.get('#LDS#Format').toPromise();
        if (val) {

          this.newSubscription = await this.reportSubscriptionService.createNewSubscription(uidReport);

          // Set PDF as default, but only if the report supports PDF
          const xformat = this.newSubscription.subscription.ExportFormat;
          const allowedFormats = xformat.Column.GetMetadata().GetLimitedValues();
          if (allowedFormats && allowedFormats.filter(f => f.Value == "PDF").length > 0) {
            xformat.value = "PDF";
          }
          
          this.parameterCdrList = [
            new BaseCdr(this.newSubscription.subscription.ExportFormat.Column, format),
            ...this.newSubscription.getParameterCdr()
          ];
          this.cdref.detectChanges();
        }
        else
          this.newSubscription = null;

      } finally {
        setTimeout(() => this.busyService.hide(overlayRef));
      }
    });

    this.disposable = errorService.setTarget('sidesheet');
  }

  public ngOnDestroy(): void {
    this.disposable();
    this.closeClickSubscription?.unsubscribe();
    this.reportChangeSubscription?.unsubscribe();
  }

  public async viewReport(): Promise<void> {
    const parameters = this.newSubscription.subscription.enrichMethodCallParameters();
    const def = new MethodDefinition(this.apiMethodFactory.portal_subscription_interactive_report_get(parameters.entityid, parameters));

    // not pretty, but the download directive does not support dynamic URLs
    const directive = new EuiDownloadDirective(null /* no element */, this.http, this.overlay, this.injector);
    directive.downloadOptions = {
      ...this.elementalUiConfigService.Config.downloadOptions,
      fileMimeType: '', // override elementalUiConfigService; get mime type from server
      url: this.config.BaseUrl + def.path,
      disableElement: false,
    };
    // start the report download
    directive.onClick();
  }

  public addFormControl(control: FormControl): void {
    this.formControls.push(control);
    this.cdref.detectChanges();
  }
}
