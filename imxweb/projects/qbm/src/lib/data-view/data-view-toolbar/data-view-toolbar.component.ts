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
 * Copyright 2024 One Identity LLC.
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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DSTViewConfig } from '../../data-source-toolbar/data-source-toolbar-view-config.interface';
import { DataViewSource } from '../data-view-source';

/**
 * @example
 * The updateConfig and the deleteConfigById Output only needs when you want to use the dataViewSettings component.
 * <imx-data-view-toolbar
 *   [dataSource]="dataSource"
 *   (updateConfig)="updateConfig($event)"
 *   (deleteConfigById)="deleteConfigById($event)"
 * ></imx-data-view-toolbar>
 */
@Component({
  selector: 'imx-data-view-toolbar',
  templateUrl: './data-view-toolbar.component.html',
  styleUrls: ['./data-view-toolbar.component.scss'],
})
export class DataViewToolbarComponent {
  /**
   * Input the dataViewSource service. It handles all the action and the data loading. This input property is required.
   */
  @Input({ required: true }) public dataSource: DataViewSource;
  @Input() showSettings = true;
  @Input() showSearch = true;
  @Input() showGrouping = true;
  /**
   * Event to emit a DSTViewConfig for post/put via the viewConfig.putViewConfig function.
   */
  @Output() public updateConfig = new EventEmitter<DSTViewConfig>();
  /**
   * Event to emit an DSTViewConfig.Id for delete via the viewConfig.deleteViewConfig function.
   */
  @Output() public deleteConfigById = new EventEmitter<string>();
  /**
   * Event to emit all the search params on change. Only need this event emitter if you use only the toolbar component.
   */
  @Output() public onSearchChange = new EventEmitter<string>();

  constructor() {}
}
