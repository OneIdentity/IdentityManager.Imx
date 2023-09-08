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

import { Component, Input, TemplateRef } from '@angular/core';

/**
 * DataSourceToolbarCustomComponent is part of the {@link DataSourceToolbarComponent}.
 * Its a customizable template (e.g. can contain user defined buttons etc)
 * and will be placed at the left side of the DataSourceToolbarComponent.
 *
 * @example
 * A data source toolbar with a custom toolbar template
 *
 * <imx-data-source-toolbar #dst [settings]="mySettings" (navigationStateChanged)="myNavigationStateChanged($event)">
 *                  <imx-data-source-toolbar-custom [customContentTemplate]="customToolbarTemplate"></imx-data-source-toolbar-custom>
 * </imx-data-source-toolbar>
 *
 * <ng-template #customToolbarTemplate>
 *                  <button mat-button>I'm a pretty button in a custom toolbar template. Please, click me!</button>
 * </ng-template>
 */
@Component({
  selector: 'imx-data-source-toolbar-custom',
  templateUrl: './data-source-toolbar-custom.component.html',
  styleUrls: ['./data-source-toolbar-custom.component.scss']
})


export class DataSourceToolbarCustomComponent {
  /**
   * Reference to a custom template.
   * If the template is undefined an empty template will be shown.
   */
  @Input() public customContentTemplate: TemplateRef<any>;
}
