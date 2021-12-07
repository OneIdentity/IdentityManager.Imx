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
 * Copyright 2021 One Identity LLC.
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

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ImxTranslationProviderService } from '../translation/imx-translation-provider.service';

/**
 * A visual presentation of the detail view header.
 */
@Component({
  selector: 'imx-data-table-detail-header',
  templateUrl: './data-table-detail-header.component.html',
  styleUrls: ['./data-table-detail-header.component.scss'],
  animations: [
    trigger('rotatedState', [
      state('default', style({ transform: 'rotate(0)' })),
      state('rotated', style({ transform: 'rotate(90deg)' })),
      transition('rotated => default', animate('0ms ease-out')),
      transition('default => rotated', animate('0ms ease-in'))
    ])
  ]
})
export class DataTableDetailHeaderComponent implements OnInit {

  /**
   * Set the inital state of the detail view.
   * Can be closed or expanded.
   * The default state is closed.
   */
  @Input() public detailOpened = false;

  /**
   * The title of the header.
   */
  @Input() public title = '';

  /**
   * Emitts an event that indicates if the detail view is expanded or not.
   */
  @Output() public detailOpenedChanged = new EventEmitter<boolean>();

  /**
   * @ignore Used internally in components template.
   * The animation state of the header component.
   * 'default' = horizontal, 'rotated' = vertical.
   */
  public state = 'default';

  /**
   * Sets the display builder.
   */
  constructor(public translateProvider: ImxTranslationProviderService) {
  }

  /**
   * @ignore Used internally.
   * Initializes header components animation.
   */
  public ngOnInit(): void {
    this.rotate();
  }

  /**
   * @ignore Used internally in components template.
   * Toggles headers component animation.
   */
  public toggleDetailView(): void {
    this.detailOpened = !this.detailOpened;
    this.rotate();
    this.detailOpenedChanged.emit(this.detailOpened);
  }

  /**
   * Rotates  detail header component and acts a toggle.
   *
   * TODO: Can we make this method private?
   */
  public rotate(): void {
    this.state = this.detailOpened ? 'default' : 'rotated';
  }
}
