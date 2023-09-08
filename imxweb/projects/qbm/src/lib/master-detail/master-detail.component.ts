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

import { Component, OnInit, ViewEncapsulation, HostBinding, ElementRef, ViewChild } from '@angular/core';
import { DeviceStateService } from '../services/device-state.service';
import * as elementResizeDetector from 'element-resize-detector';

/** @deprecated This component is deprecated and will be removed in a future release.*/
@Component({
  selector: 'imx-master-detail',
  templateUrl: './master-detail.component.html',
  styleUrls: ['./master-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MasterDetailComponent implements OnInit {
  public detailClosed: boolean;
  public isSinglePanel: boolean;
  public modalRoot: ElementRef;

  @HostBinding('class') public defaultHostClasses = 'imx-flex imx-flex-child';

  @ViewChild('mdcContainer', { static: true }) public mdcContainer: ElementRef;
  @ViewChild('mdcDetail', { static: true }) public mdcDetail: ElementRef;

  private detailContainerClass = 'imx-mdc-detailPopupContainer';

  constructor(public deviceStateService: DeviceStateService) {}

  public ngOnInit() {
    this.detailClosed = false;
    this.isSinglePanel = false;
    if (this.isPhoneDevice()) {
      // initially close the detail panel on phone device
      this.toggleDetailPane(false);
    }

    const elementResizeDetectorMaker = elementResizeDetector;

    const erd = elementResizeDetectorMaker({ strategy: 'scroll' });
    erd.listenTo(this.mdcContainer.nativeElement, () => {
      this.checkMode();
    });
  }

  // #region Css Classes
  public masterDetailRootClasses() {
    return {
      'imx-mdc-masterdetail imx-flex-child': true,
      'imx-mdc-detail-close': this.detailClosed,
      'imx-mdc-detail-opened': !this.detailClosed,
      'imx-mdc-singlePanel': this.isSinglePanel
    };
  }

  public masterClasses() {
    return 'imx-mdc-master imx-flex';
  }

  public detailClasses() {
    return {
      'imx-mdc-detail imx-flex': true,
      'imx-mdc-detail-close': this.detailClosed
    };
  }

  public detailHeaderClasses() {
    return 'imx-mdc-detail-header';
  }

  public detailContentClasses() {
    return {
      'imx-mdc-detail-content imx-flex': true,
      'imx-mdc-detail-closed': this.detailClosed
    };
  }

  public detailContentWrapperClasses() {
    return 'imx-mdc-detail-contentWrapper';
  }
  // #endregion

  public getDeviceState(): string {
    return this.deviceStateService.deviceState;
  }

  public isPhoneDevice(): boolean {
    return this.deviceStateService.isPhoneDevice();
  }

  public toggleDetailPane(state?: boolean) {
    this.detailClosed = !this.detailClosed;
    // force to open or to close the detail panel
    state = typeof state === 'boolean' ? state : undefined;
    if (state !== undefined) {
      this.detailClosed = state;
    }
  }

  public openDetailPane() {
    if (this.isPhoneDevice()) {
      this.toggleDetailPane(false);
    }
  }

  public checkMode() {
    const detailPopupContainer = this.mdcContainer;
    if (this.isPhoneDevice()) {
      this.isSinglePanel = true;
      return;
    }
    // normal mode
    // --> move detail panel next to the master panel
    this.mdcContainer.nativeElement.appendChild(this.mdcDetail.nativeElement);
    this.isSinglePanel = false;
  }
}
