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
import * as elementResizeDetector from 'element-resize-detector';

/** @deprecated This service is deprecated and will be removed in a future release.*/
@Injectable()
export class DeviceStateService {

  get deviceState(): string {
    this._deviceState = this.getCurrentDeviceState();
    return this._deviceState;
  }

  private _deviceState = 'desktop';
  constructor() {
    this.createDeviceStateIndicator();
  }

  public isPhoneDevice(): boolean {
    return this.deviceState === 'mobile';
  }

  private createDeviceStateIndicator(): HTMLElement {
    const indicatorNode = document.createElement('div');
    indicatorNode.className = 'state-indicator';
    document.body.appendChild(indicatorNode);

    // importing a commonjs module
    // const elementResizeDetectorMaker = require('element-resize-detector');
    const elementResizeDetectorMaker = elementResizeDetector;
    const erd = elementResizeDetectorMaker({
      strategy: 'scroll'
    });
    erd.listenTo(document.body, () => this.deviceState);
    return indicatorNode;
  }

  private getCurrentDeviceState(): string {
    const indicatorNode = this.getOrCreateIndicatorNode();
    return this.getDeviceStateFromNode(indicatorNode);
  }

  private getOrCreateIndicatorNode() {
    const indicatorNode = document.querySelector('.state-indicator');
    return indicatorNode || this.createDeviceStateIndicator();
  }

  private getDeviceStateFromNode(indicatorNode: Element) {
    let state = window.getComputedStyle(indicatorNode, ':before').getPropertyValue('content');
    // delete quotes
    state = state.replace(/['"]+/g, '');
    this._deviceState = state;
    return state;
  }
}
