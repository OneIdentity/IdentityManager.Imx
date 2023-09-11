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
import { OverlayRef } from '@angular/cdk/overlay';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { AfterViewInit, ChangeDetectorRef, Component, forwardRef, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { ControlValueAccessor, UntypedFormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSelectionListChange } from '@angular/material/list';
import { EuiLoadingService } from '@elemental-ui/core';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import {
  CollectionLoadParameters,
  EntityData,
  IEntityColumn
} from 'imx-qbm-dbts';
import { MultiValueService } from '../multi-value/multi-value.service';
import { SettingsService } from '../settings/settings-service';

@Component({
  selector: 'imx-multi-select-formcontrol',
  templateUrl: './multi-select-formcontrol.component.html',
  styleUrls: ['./multi-select-formcontrol.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectFormcontrolComponent),
      multi: true,
    }
  ],
})
export class MultiSelectFormcontrolComponent implements ControlValueAccessor, OnChanges, OnDestroy, AfterViewInit {

  public candidatesTotalCount: number;
  public loading = false;
  public candidates: EntityData[];
  public selectedCandidates: EntityData[] = [];

  public onChange: (event: IEntityColumn) => void;
  public onTouch: (event: IEntityColumn) => void;
  public entityColumn: IEntityColumn;
  public readonly searchControl = new UntypedFormControl();
  public uidReport: string;

  @Input() public pushMethod: 'auto' | 'manual' = 'auto';
  @Input() public selectedElementsCaption: string;

  private parameters: CollectionLoadParameters;
  private readonly subscriptions: Subscription[] = [];

  @ViewChild('viewport') private viewport: CdkVirtualScrollViewport;

  constructor(
    private readonly multiValueProvider: MultiValueService,
    private readonly busyService: EuiLoadingService,
    private readonly settingsService: SettingsService,
    private readonly changeDetectorRef: ChangeDetectorRef) {
    this.initSearchControl();
  }

  public async ngOnChanges(): Promise<void> {
    await this.loadData({
      StartIndex: 0,
      PageSize: this.settingsService.DefaultPageSize,
      filter: undefined,
      search: undefined
    });
    this.changeDetectorRef.detectChanges();
  }

  public async writeValue(column: IEntityColumn): Promise<void> {
    this.entityColumn = column;
    await this.loadData();
  }

  public registerOnChange(fn: (event: IEntityColumn) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: (event: IEntityColumn) => void): void {
    this.onTouch = fn;
  }

  public async ngAfterViewInit(): Promise<void> {
    this.parameters = { PageSize: this.settingsService.DefaultPageSize, StartIndex: 0 };

    this.subscriptions.push(this.viewport.renderedRangeStream.subscribe(async (range: ListRange) => {
      if (range.end === (this.settingsService.DefaultPageSize + this.parameters.StartIndex)) {
        this.parameters.StartIndex += this.settingsService.DefaultPageSize;

        const tmpCandidates = Object.assign([], this.candidates);
        await this.loadData(this.parameters);

        this.candidates.unshift(...tmpCandidates);
        this.changeDetectorRef.detectChanges();
      }
    }));
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public async updateSelected(selection: MatSelectionListChange): Promise<void> {
    const selectedChange: string[] = selection.options.map(option => option.value.Keys[0]);
    if (this.selectedCandidates.findIndex(elem => selectedChange.includes(elem.Keys[0])) !== -1) {
      return;
    }
    this.selectedCandidates.push(...selection.options.map(option => option.value));
    if (this.pushMethod === 'auto') {
      await this.putNewValue();
    }
  }

  public async clearSelection(): Promise<void> {
    this.selectedCandidates = [];
    if (this.pushMethod === 'auto') {
      await this.putNewValue();
    }
  }

  public async removeSelectedAtIndex(i: number): Promise<void> {
    this.selectedCandidates.splice(i, 1);
    if (this.pushMethod === 'auto') {
      await this.putNewValue();
    }
  }

  public async pushValue(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      await this.putNewValue();
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  private async putNewValue(): Promise<void> {
    const value = this.selectedCandidates && this.selectedCandidates.length > 0 ?
      this.multiValueProvider.getMultiValue(this.selectedCandidates.map(elem => elem.Keys[0]))
      : '';

    await this.entityColumn.PutValue(value);
    this.onChange(this.entityColumn);
  }

  private initSearchControl(): void {
    this.searchControl.setValue('');
    this.subscriptions.push(this.searchControl.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(300)).subscribe(async (value) => {
        await this.loadData({ StartIndex: 0, PageSize: this.settingsService.DefaultPageSize, search: value });
        this.viewport.scrollToIndex(0);
        this.changeDetectorRef.detectChanges();
      }));

  }

  private async loadData(newState?: CollectionLoadParameters): Promise<void> {
    if (this.entityColumn == null) {
      this.candidates = [];
      return;
    }
    try {
      setTimeout(() => this.loading = true);
      this.parameters = { ...this.parameters, ...newState };


      const data = await this.entityColumn.GetMetadata().GetFkRelations()[0].Get(this.parameters);
      this.candidates = data.Entities;
    } finally {
      this.loading = false;
    }
  }
}
