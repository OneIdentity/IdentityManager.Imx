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

import { Component, Input, ContentChild, TemplateRef, ElementRef } from '@angular/core';

@Component({
  selector: 'imx-icon-tile',
  templateUrl: './icon-tile.component.html',
  styleUrls: ['./icon-tile.component.scss']
})
export class IconTileComponent {

  @Input() public image: string;
  @Input() public caption: string;
  @Input() public subtitle: string;
  @Input() public identifier: string;
  @Input() public loadingState: boolean = false;

  @ContentChild('ActionTemplate', { static: true }) public actionTemplate: TemplateRef<ElementRef>;
}
