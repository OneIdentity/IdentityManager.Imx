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

import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OverlayRef } from '@angular/cdk/overlay';
import { EuiLoadingService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { ObjectHistoryEvent } from 'imx-qbm-dbts';
import { ObjectHistoryService, ObjectHistoryParameters } from './object-history.service';

import { DateAdapter } from '@angular/material/core';
import moment from 'moment-timezone';

class ViewMode {
  public value: string;
  public display: string;
}

// TODO: One class per file.
// tslint:disable-next-line: max-classes-per-file
@Component({
  selector: 'imx-object-history',
  templateUrl: './object-history.component.html',
  styleUrls: ['./object-history.component.scss']
})
export class ObjectHistoryComponent implements OnInit {
  public get viewModeTimeline(): string {
    return 'Timeline';
  }
  public get viewModeGrid(): string {
    return 'Grid';
  }

  public viewModeValue: string;
  public historyData: ObjectHistoryEvent[] = [];
  public viewModes: ViewMode[] = [];

  @Input() objectType: string;
  @Input() objectUid: string;
  @Input() viewMode: 'Timeline' | 'Grid';
  @Input() showTitle: boolean = true;

  private parameters: ObjectHistoryParameters;

  public get effectiveViewMode(): string {
    // the viewMode passed as an input takes precedence
    if (this.viewMode) {
      return this.viewMode;
    }
    return this.viewModeValue;
  }

  constructor(
    private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private busyService: EuiLoadingService,
    private historyService: ObjectHistoryService,
    private dateAdapter: DateAdapter<any>
  ) { }

  public async ngOnInit(): Promise<void> {

    this.addViewMode(this.viewModeTimeline, '#LDS#Timeline');
    this.addViewMode(this.viewModeGrid, '#LDS#Table');
    this.viewModeValue = this.viewModeTimeline;

    this.parameters = {
      table: this.objectType || this.activatedRoute.snapshot.paramMap.get('table'),
      uid: this.objectUid || this.activatedRoute.snapshot.paramMap.get('uid')
    };

    await this.refresh();

  }

  public setLocale(locale: string): void {
    moment.locale(locale);
    this.dateAdapter.setLocale(locale);
  }

  public async refresh(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => overlayRef = this.busyService.show());
    try {
      this.historyData = (await this.historyService.get(this.parameters));
    } catch {
      this.historyData = [];
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
  }

  private async addViewMode(value: string, displayKey: string): Promise<void> {
    const viewMode = new ViewMode();
    viewMode.value = value;
    viewMode.display = await this.translate.get(displayKey).toPromise();
    this.viewModes.push(viewMode);
  }
}
