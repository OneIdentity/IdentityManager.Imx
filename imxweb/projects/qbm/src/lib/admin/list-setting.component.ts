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

import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { imx_SessionService } from '../session/imx-session.service';
import { KeyData } from './config-section';
import { ConfigSettingType, ConfigSettingValidValue } from 'imx-api-qbm';
import { ConfigService } from './config.service';

@Component({
  selector: "imx-list-setting",
  templateUrl: './list-setting.component.html',
  styleUrls: ['./list-setting.component.scss']
})
export class ListSettingComponent implements OnInit, OnChanges {

  constructor(private readonly session: imx_SessionService, private readonly configSvc: ConfigService) {
  }

  @Input() public setting: KeyData;

  public validvalues: ConfigSettingValidValue[] = [];
  public hasLimitedValues: boolean;

  ngOnInit(): void {
    this.load();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.setting?.firstChange) return;

    this.load();
  }

  async load() {
    this.hasLimitedValues = this.setting.Type == ConfigSettingType.LimitedValues;
    if (this.hasLimitedValues) {
      this.validvalues = await this.session.Client.admin_apiconfig_values_get(this.configSvc.appId, this.setting.Path);
    };
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.setting.Value, event.previousIndex, event.currentIndex);
    this.configSvc.addChange(this.setting);
  }

  delete(ind: number) {
    this.setting.Value.splice(ind, 1);
    this.configSvc.addChange(this.setting);
  }

  addNew() {
    this.setting.Value.push(null);
    this.configSvc.addChange(this.setting);
  }

  optionSelected() {
    this.configSvc.addChange(this.setting);
  }

  // https://stackoverflow.com/questions/42322968/angular2-dynamic-input-field-lose-focus-when-input-changes
  trackByFn(index: any, item: any) {
    return index;
  }
}
