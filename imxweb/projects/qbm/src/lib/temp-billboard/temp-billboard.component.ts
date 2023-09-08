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

/**
 * @copyright One Identity 2023
 * @license All Rights Reserved
 */

import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Chart, ChartOptions } from 'billboard.js';
import { debounceTime, tap } from 'rxjs/operators';
import { EuiThemeService, EuiTheme } from '@elemental-ui/core';
import { TempBillboardService } from './temp-billboard.service';

/**
 * @deprecated This will be removed with A15 support.
 */
@Component({
  selector: 'imx-temp-billboard',
  template: '<div></div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TempBillboardComponent implements OnDestroy, OnInit {
  /**
   * You can set billboard.js options with this input, more details see ChartOptions type
   *
   * @category Input
   */
  @Input()
  public set options(options: ChartOptions) {
    if (!options) {
      return;
    }

    this._options = options;
  }

  /**
   * Emit the generated chart to use for advanced functionality
   *
   * @category Output
   * @event
   */
  @Output()
  public chart = new EventEmitter<Chart>();

  /**
   * Emit event before chart destroy
   *
   * @category Output
   * @event
   */
  @Output()
  public beforeDestroy = new EventEmitter<boolean>();

  private _chart: Chart | null = null;
  private _options: ChartOptions;
  private _currentTheme: EuiTheme;

  constructor(private elementRef: ElementRef, private euiThemeService: EuiThemeService, private chartService: TempBillboardService) {}

  /** @internal */
  ngOnInit(): void {
    this.euiThemeService
      .getActualTheme()
      .pipe(
        debounceTime(0),
        tap((theme: EuiTheme) => {
          this._currentTheme = theme;
          this.setupChart();
        })
      )
      .subscribe();
  }

  /** @internal */
  ngOnDestroy(): void {
    this.beforeDestroy.emit(true);
    if (this._chart?.$?.svg) {
      this._chart.destroy();
    }
  }

  private setupChart(): void {
    if (!this._options) {
      return;
    }

    this.updateColors();

    if (this._chart !== null) {
      this._chart.destroy();
    }

    this._chart = this.chartService.generate({
      bindto: this.elementRef.nativeElement.firstChild,
      ...this._options,
    });

    this.chart.emit(this._chart);
  }

  private updateColors(): void {
    let colors: string[] = ['#0a96d1', '#db2534', '#4ba803', '#ead200', '#b400e5', '#f800b6', '#616566'];

    if (this._currentTheme === EuiTheme.DARK || this._currentTheme === EuiTheme.CONTRAST) {
      colors = ['#8acbe3', '#f29d99', '#99c478', '#f2e991', '#d98eed', '#fa96df', '#aab0b3'];
    }

    if (!this._options.color) {
      this._options.color = {};
    }

    this._options.color.pattern = colors;
  }
}
