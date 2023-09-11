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

import { ListRange } from '@angular/cdk/collections';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { AfterViewInit, ChangeDetectorRef, Component, forwardRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, UntypedFormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSelectionListChange } from '@angular/material/list';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { PortalReports } from 'imx-api-rps';
import { CollectionLoadParameters } from 'imx-qbm-dbts';
import { ReportSubscriptionService } from '../../report-subscription/report-subscription.service';
import { SettingsService } from 'qbm';

@Component({
  selector: 'imx-report-selector',
  templateUrl: './report-selector.component.html',
  styleUrls: ['./report-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ReportSelectorComponent),
      multi: true,
    },
  ],
})
export class ReportSelectorComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {
  public candidatesTotalCount: number;
  public loading = false;

  public candidates: PortalReports[];
  public onChange: (event: string) => void;
  public onTouch: (event: string) => void;

  public searchControl = new UntypedFormControl();

  public uidReport: string;
  private parameters: CollectionLoadParameters;
  private readonly subscribers: Subscription[] = [];

  @ViewChild('viewport') private viewport: CdkVirtualScrollViewport;
  @Input() controlHeigth = 200;

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly settings: SettingsService,
    private readonly reportSubscriptionService: ReportSubscriptionService
  ) {}

  public async ngOnInit(): Promise<void> {
    this.initSearchControl();
    await this.loadReports({
      StartIndex: 0,
      PageSize: this.settings.DefaultPageSize,
      filter: undefined,
      search: undefined,
    });

    this.changeDetectorRef.detectChanges();
  }

  public writeValue(filter: string): void {
    this.uidReport = filter;
  }

  public registerOnChange(fn: (event: string) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: (event: string) => void): void {
    this.onTouch = fn;
  }

  public async ngAfterViewInit(): Promise<void> {
    this.parameters = { PageSize: this.settings.DefaultPageSize, StartIndex: 0 };

    this.subscribers.push(
      this.viewport.renderedRangeStream.subscribe(async (range: ListRange) => {
        if (range.end === 20 + this.parameters.StartIndex) {
          this.parameters.StartIndex += 20;

          const tmpCandidates = Object.assign([], this.candidates);
          await this.loadReports(this.parameters);

          this.candidates.unshift(...tmpCandidates);
          this.changeDetectorRef.detectChanges();
        }
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscribers.forEach((s) => s.unsubscribe());
  }

  public updateSelected(elem: MatSelectionListChange): void {
    // Only one can be selected
    const chosenElem = elem.options.find((ele) => ele.selected);
    this.writeValue(chosenElem.value.GetEntity().GetKeys()[0]);
    this.onChange(chosenElem.value.GetEntity().GetKeys()[0]);
  }

  private async loadReports(newState?: CollectionLoadParameters): Promise<void> {
    try {
      setTimeout(() => (this.loading = true));
      this.parameters = { ...this.parameters, ...newState };
      this.candidates = (await this.reportSubscriptionService.getReportCandidates(this.parameters)).Data;
    } finally {
      this.loading = false;
    }
  }

  private initSearchControl(): void {
    this.searchControl.setValue('');
    this.subscribers.push(
      this.searchControl.valueChanges.pipe(distinctUntilChanged(), debounceTime(300)).subscribe(async (value) => {
        await this.loadReports({ StartIndex: 0, PageSize: this.settings.DefaultPageSize, search: value });
        this.viewport.scrollToIndex(0);
        this.changeDetectorRef.detectChanges();
      })
    );
  }
}
