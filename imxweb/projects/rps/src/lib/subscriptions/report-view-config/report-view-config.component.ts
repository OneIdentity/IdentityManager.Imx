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

import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormArray, FormControl, FormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { EuiSidesheetRef, EuiSidesheetService } from '@elemental-ui/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { BaseCdr, BusyService, ColumnDependentReference, ErrorService } from 'qbm';
import { ReportSubscription } from '../report-subscription/report-subscription';
import { ReportSubscriptionService } from '../report-subscription/report-subscription.service';
import { ListReportViewerSidesheetComponent } from '../list-report-viewer-sidesheet/list-report-viewer-sidesheet.component';
import { ListReportViewerService } from '../../list-report-viewer/list-report-viewer.service';

interface reportForm {
  viewType: FormControl<'view' | 'export'>;
  reportTable: FormControl<string>;
  exportType: FormControl<string>
  parameters: FormArray<any>;
}
@Component({
  selector: 'imx-report-view-config',
  templateUrl: './report-view-config.component.html',
  styleUrls: ['./report-view-config.component.scss'],
})
export class ReportViewConfigComponent implements OnDestroy {
  public readonly reportFormGroup = new FormGroup<reportForm>({
    viewType: new FormControl('view'),
    reportTable: new FormControl(undefined, Validators.required),
    exportType: new FormControl(undefined),
    parameters: new FormArray([]),
  });
  public newSubscription: ReportSubscription;
  public parameterCdrList: ColumnDependentReference[] = [];
  public formatCdr: ColumnDependentReference;
  public busyService = new BusyService();
  public isLoading = false;
  public reportIsLoaded = false;

  public isListReport = false;
  private uidReport = '';

  private subscriptions: Subscription[] = [];
  private disposable: () => void;

  public get formControls(): FormArray {
    return this.reportFormGroup.controls.parameters;
  }

  public get hasParameter(): boolean {
    return this.reportFormGroup.controls.viewType.value === 'view' && this.isListReport
      ? this.parameterCdrList.filter((elem) => elem.column.ColumnName !== 'ExportFormat').length > 0
      : this.parameterCdrList.length > 0;
  }

  constructor(
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly sideSheet: EuiSidesheetService,
    private readonly reportSubscriptionService: ReportSubscriptionService,
    private readonly cdref: ChangeDetectorRef,
    private readonly translate: TranslateService,
    private readonly viewReportService: ListReportViewerService,
    errorService: ErrorService
  ) {
    this.subscriptions.push(
      this.sidesheetRef.closeClicked().subscribe(async () => {
        this.sidesheetRef.close(false);
      })
    );

    this.subscriptions.push(
      this.busyService.busyStateChanged.subscribe((elem) => {
        this.isLoading = elem;
        this.cdref.detectChanges();
      })
    );

    this.subscriptions.push(
      this.reportFormGroup.controls.reportTable.valueChanges.subscribe(async (val) => {
        const isBusy = this.busyService.beginBusy();
        try {
          this.uidReport = val;
          this.formControls.clear();

          // Standard caption is "Format (e-mail attachment)" -> change
          const format = await this.translate.get('#LDS#Format').toPromise();
          if (val) {
            this.newSubscription = await this.reportSubscriptionService.createNewSubscription(this.uidReport);

            this.isListReport = this.newSubscription.subscription.IsListReport.value;
            // Set PDF as default, but only if the report supports PDF
            const xformat = this.newSubscription.subscription.ExportFormat;
            const allowedFormats = xformat.Column.GetMetadata().GetLimitedValues();
            if (allowedFormats && allowedFormats.filter((f) => f.Value == 'PDF').length > 0) {
              xformat.value = 'PDF';
            }

            this.formatCdr = new BaseCdr(this.newSubscription.subscription.ExportFormat.Column, format);
            this.parameterCdrList = [...this.newSubscription.getParameterCdr()];
            this.cdref.detectChanges();
          } else this.newSubscription = null;
        } finally {
          isBusy.endBusy();
          this.reportIsLoaded = this.newSubscription != null;
        }
      })
    );

    this.disposable = errorService.setTarget('sidesheet');
  }


  public ngOnDestroy(): void {
    // sometimes there are problems with usage of disposed components
    setTimeout(() => {
      this.disposable();
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.newSubscription?.unsubscribeEvents();
    });
  }

  public async viewReport(): Promise<void> {
    if (this.reportFormGroup.controls.viewType.value === 'view' && this.isListReport) {
      await this.viewReportInTable();
    } else {
      this.reportSubscriptionService.downloadSubsciption(this.newSubscription);
    }
  }

  public addFormControl(control: UntypedFormControl): void {
    this.formControls.push(control);
    this.cdref.detectChanges();
  }

  private async viewReportInTable(): Promise<void> {
    this.viewReportService.setUidReport(this.uidReport);
    const data = { dataService: this.viewReportService, subscription: this.newSubscription };
    this.sideSheet.open(ListReportViewerSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading View Report').toPromise(),
      subTitle: this.newSubscription.subscription.GetEntity().GetDisplay(),
      padding: '0',
      width: 'max(550px,55%)',
      testId: 'report-view-config-report-viewer',
      data,
    });
  }
}
